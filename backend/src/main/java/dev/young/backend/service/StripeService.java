/*
stripe listen --forward-to localhost:8082/api/v1/stripe/webhook --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted
*/
package dev.young.backend.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.model.checkout.Session;
import com.stripe.net.RequestOptions;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.CustomerUpdateParams;
import com.stripe.param.PriceListParams;
import com.stripe.param.checkout.SessionCreateParams;
import dev.young.backend.entity.User;
import dev.young.backend.repository.SubscriptionRepository;
import dev.young.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

import static com.stripe.param.checkout.SessionCreateParams.Mode.SUBSCRIPTION;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripeService {

    @Value("${frontend.url}")
    private String siteUrl;

    @Value("${application.stripe.secret-key}")
    private String stripeSecretKey;
    @Value("${application.stripe.client-id}")
    private String stripeClientId;
    @Value("${application.stripe.prices.starter-monthly}")
    private String starterMonthly;
    @Value("${application.stripe.prices.starter-yearly}")
    private String starterYearly;
    @Value("${application.stripe.prices.pro-monthly}")
    private String proMonthly;
    @Value("${application.stripe.prices.pro-yearly}")
    private String proYearly;

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;

    @PostConstruct
    private void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public String createSubscriptionCheckOutSession(Authentication authentication, String plan) {
        UUID userId = (UUID) authentication.getPrincipal();
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found with id " + userId));
        String customerId = getStripeCustomerId(user);

        RequestOptions options = RequestOptions.builder()
                .setApiKey(stripeSecretKey)
                .setIdempotencyKey(UUID.randomUUID().toString())
                .build();

        PriceListParams priceParams = PriceListParams.builder()
                .addLookupKey(plan)
                .setActive(true)
                .build();

        try {
            PriceCollection prices = Price.list(priceParams);

            if (prices.getData().isEmpty()) {
                throw new IllegalStateException("No price found for plan: " + plan);
            }

            String priceId = prices.getData().get(0).getId();
            String tier = resolveTierFromPriceId(priceId);
            ;

            SessionCreateParams sessionParams = SessionCreateParams.builder()
                    .setMode(SUBSCRIPTION)
                    .setCustomer(customerId)
                    .setSuccessUrl(siteUrl + "/me")
                    .setCancelUrl(siteUrl + "/me")
//                    .setUiMode(EMBEDDED)
                    .putMetadata("priceId", priceId)
                    .putMetadata("tier", tier)
                    .putMetadata("plan", plan)
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setPrice(priceId)
                                    .setQuantity(1L)
                                    .build()
                    )
                    .build();

            Session session = Session.create(sessionParams, options);

            if (session == null || session.getUrl() == null) {
                throw new RuntimeException("Error creating checkout session");
            }

            return session.getUrl();
        } catch (StripeException e) {
            log.error("StripeException when creating checkout session: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create Stripe Checkout session", e);
        }
    }

    public String createPortalSession(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found with id " + userId));
        String customerId = getStripeCustomerId(user);

        RequestOptions options = RequestOptions.builder()
                .setApiKey(stripeSecretKey)
                .setIdempotencyKey(UUID.randomUUID().toString())
                .build();

        com.stripe.param.billingportal.SessionCreateParams params = new com.stripe.param.billingportal.SessionCreateParams.Builder()
                .setCustomer(customerId)
                .setReturnUrl(siteUrl + "/me").build();

        try {
            com.stripe.model.billingportal.Session session = com.stripe.model.billingportal.Session.create(params, options);

            if (session == null || session.getUrl() == null) {
                throw new RuntimeException("Error creating checkout session");
            }

            return session.getUrl();
        } catch (StripeException e) {
            log.error("StripeException when creating portal session: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create Stripe Portal session", e);
        }
    }

    public void processEvent(Event event) {
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = dataObjectDeserializer.getObject()
                .orElseThrow(() -> new RuntimeException("Failed to deserialize Stripe event object"));

        switch (event.getType()) {
            case "checkout.session.completed" -> handleCheckoutSessionCompleted(stripeObject);
            case "customer.subscription.updated" -> handleSubscriptionUpdated(stripeObject);
            case "customer.subscription.deleted" -> handleSubscriptionDeleted(stripeObject);
            default -> log.info("Unhandled Stripe event type: {}", event.getType());
        }
    }

    private void handleCheckoutSessionCompleted(StripeObject stripeObject) {
        Session session = (Session) stripeObject;

        if (!"subscription".equals(session.getMode())) {
            log.info("Ignoring session not in subscription mode");
            return;
        }

        String subscriptionId = session.getSubscription();
        String customerId = session.getCustomer();

        if (subscriptionId == null || customerId == null) {
            log.warn("Missing subscription or customer ID in session {}", session.getId());
            return;
        }

        User user = userRepository.findByStripeCustomerId(customerId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with customer ID: " + customerId));

        dev.young.backend.entity.Subscription localSub = user.getSubscription();

        if (localSub == null) {
            log.warn("User {} does not have a local subscription record. Skipping update.", user.getId());
            return;
        }

        Subscription subscription = getSubscriptionBySubscriptionId(subscriptionId);
        if (subscription == null) {
            log.error("Could not retrieve subscription from Stripe with ID {}", subscriptionId);
            return;
        }

        SubscriptionItem item = subscription.getItems().getData().get(0);
        String plan = item.getPrice().getLookupKey();
        if (plan == null) {
            plan = item.getPrice().getId(); // fallback
        }
        String tier = plan.substring(0, plan.indexOf("_"));

        localSub.setTier(tier);
        localSub.setPlan(plan);
        localSub.setStatus(subscription.getStatus());
        localSub.setStripeSubscriptionId(subscription.getId());
        localSub.setCurrentPeriodStart(item.getCurrentPeriodStart());
        localSub.setCurrentPeriodEnd(item.getCurrentPeriodEnd());

        subscriptionRepository.save(localSub);
        log.info("Updated local subscription via checkout.session.completed for user {}", user.getId());
    }

    private void handleSubscriptionUpdated(StripeObject stripeObject) {
        Subscription subscription = (Subscription) stripeObject;
        String stripeSubscriptionId = subscription.getId();

        dev.young.backend.entity.Subscription localSub = subscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found with Stripe ID: " + stripeSubscriptionId));

        if (subscription.getItems().getData().isEmpty()) {
            log.warn("No subscription items found in update event for subscription {}", stripeSubscriptionId);
            return;
        }

        SubscriptionItem item = subscription.getItems().getData().get(0);

        String plan = item.getPrice().getLookupKey();
        if (plan == null) {
            plan = item.getPrice().getId(); // fallback
        }
        String tier = plan.substring(0, plan.indexOf("_"));

        localSub.setTier(tier);
        localSub.setPlan(plan);
        localSub.setStatus(subscription.getStatus());
        localSub.setCurrentPeriodStart(item.getCurrentPeriodStart());
        localSub.setCurrentPeriodEnd(item.getCurrentPeriodEnd());

        subscriptionRepository.save(localSub);
        log.info("Updated local subscription from Stripe update event for subscription {}", stripeSubscriptionId);
    }

    private void handleSubscriptionDeleted(StripeObject stripeObject) {
        Subscription subscription = (Subscription) stripeObject;
        String stripeSubscriptionId = subscription.getId();

        dev.young.backend.entity.Subscription localSub = subscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found with Stripe ID: " + stripeSubscriptionId));

        localSub.setPlan("lite");
        localSub.setTier("lite");
        localSub.setStatus("canceled");
        localSub.setStripeSubscriptionId(null);
        localSub.setCurrentPeriodStart(null);
        localSub.setCurrentPeriodEnd(null);

        subscriptionRepository.save(localSub);
        log.info("Soft-deleted local subscription by downgrading to 'lite' for Stripe subscription {}", stripeSubscriptionId);
    }

    public void updateCustomerName(String customerId, String newUserName) {
        try {
            Customer customer = Customer.retrieve(customerId);
            ;

            RequestOptions options = RequestOptions.builder()
                    .setApiKey(stripeSecretKey)
                    .setIdempotencyKey(UUID.randomUUID().toString())
                    .build();

            CustomerUpdateParams params = CustomerUpdateParams.builder()
                    .setName(newUserName)
                    .build();

            customer.update(params, options);
        } catch (StripeException e) {
            log.error("Error updating customer name for user {}: {}", newUserName, e.getMessage(), e);
        }
    }

    private Subscription getSubscriptionBySubscriptionId(String subscriptionId) {
        try {
            return Subscription.retrieve(subscriptionId);
        } catch (StripeException e) {
            log.error("Error retrieving subscription with ID {}: {}", subscriptionId, e.getMessage(), e);
            return null;
        }
    }


    private String getStripeCustomerId(User user) {
        if (user.getStripeCustomerId() != null) {
            return user.getStripeCustomerId();
        }

        RequestOptions options = RequestOptions.builder()
                .setApiKey(stripeSecretKey)
                .setIdempotencyKey(UUID.randomUUID().toString())
                .build();

        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(user.getEmail())
                .setName(user.getUsername())
                .putMetadata("userId", String.valueOf(user.getId()))
                .build();

        try {
            Customer customer = Customer.create(params, options);
            user.setStripeCustomerId(customer.getId());
            userRepository.save(user);
            return customer.getId();
        } catch (StripeException e) {
            log.error("Error creating customer for user {}: {}", user.getId(), e.getMessage(), e);
            throw new RuntimeException("Unable to create Stripe Checkout session", e);
        }
    }

    private String resolveTierFromPriceId(String priceId) {
        if (priceId.equalsIgnoreCase(starterMonthly) || priceId.equalsIgnoreCase(starterYearly)) {
            return "starter";
        } else if (priceId.equalsIgnoreCase(proMonthly) || priceId.equalsIgnoreCase(proYearly)) {
            return "pro";
        }

        return "free";
    }
}