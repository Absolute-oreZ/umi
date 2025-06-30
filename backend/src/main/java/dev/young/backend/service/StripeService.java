package dev.young.backend.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.model.checkout.Session;
import com.stripe.net.RequestOptions;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.CustomerUpdateParams;
import com.stripe.param.PriceListParams;
import com.stripe.param.SubscriptionUpdateParams;
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

import java.util.Collections;
import java.util.UUID;

import static com.stripe.param.checkout.SessionCreateParams.ConsentCollection.TermsOfService.REQUIRED;
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

    public void updateCustomerName(String customerId, String newUserName) {
        try {
            Customer customer = Customer.retrieve(customerId);
            ;

            RequestOptions options = RequestOptions.builder()
                    .setIdempotencyKey(UUID.randomUUID().toString())
                    .setStripeAccount(stripeClientId)
                    .build();

            CustomerUpdateParams params = CustomerUpdateParams.builder()
                    .setName(newUserName)
                    .build();

            customer.update(params, options);
        } catch (StripeException e) {
            log.error("Error updating customer name for user {}: {}", newUserName, e.getMessage(), e);
        }
    }

    public Session createSubscriptionCheckOutSession(Authentication authentication, String plan) {
        UUID userId = (UUID) authentication.getPrincipal();
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found with id " + userId));
        String customerId = getStripeCustomerId(user);

        RequestOptions options = RequestOptions.builder()
                .setIdempotencyKey(UUID.randomUUID().toString())
                .setStripeAccount(stripeClientId)
                .build();

        PriceListParams priceParams = PriceListParams.builder()
                .addAllLookupKey(Collections.singletonList(plan.toLowerCase()))
                .setActive(true)
                .build();


        try {
            PriceCollection prices = Price.list(priceParams);

            if (prices.getData().isEmpty()) {
                throw new IllegalStateException("No price found for plan: " + plan);
            }

            String priceId = prices.getData().get(0).getId();
            String tier = resolveTierFromPriceId(priceId);

            SessionCreateParams sessionParams = SessionCreateParams.builder()
                    .setMode(SUBSCRIPTION)
                    .setCustomer(customerId)
                    .setSuccessUrl(siteUrl + "/me?checkout=success")
                    .setCancelUrl(siteUrl + "/me?checkout=cancel")
                    .setConsentCollection(SessionCreateParams.ConsentCollection.builder()
                            .setTermsOfService(REQUIRED)
                            .build())
//                    .setUiMode(EMBEDDED)
                    .putMetadata("priceId", priceId)
                    .putMetadata("tier", tier)
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setPrice(priceId)
                                    .setQuantity(1L)
                                    .build()
                    )
                    .build();

            return Session.create(sessionParams, options);
        } catch (StripeException e) {
            log.error("StripeException when creating checkout session: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create Stripe Checkout session", e);
        }
    }

    public void processEvent(Event event) {
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = null;

        if (dataObjectDeserializer.getObject().isPresent()) {
            stripeObject = dataObjectDeserializer.getObject().get();
        } else {
            // Deserialization failed, probably due to an API version mismatch.
            // Refer to the Javadoc documentation on `EventDataObjectDeserializer` for
            // instructions on how to handle this case, or return an error here.
            log.error("Failed to deserialize object, might due to API version mismatch");
            throw new RuntimeException("Failed to deserialize object,contact support");
        }

        switch (event.getType()) {
            case "checkout.session.completed" -> handleCheckoutSessionCompleted(stripeObject);
            case "customer.subscription.created" -> handleSubscriptionCreated(stripeObject);
            case "customer.subscription.updated" -> handleSubscriptionUpdated(stripeObject);
            case "customer.subscription.deleted" -> handleSubscriptionDeleted(stripeObject);
            default -> {
                log.info("Unhandled event type {}", event.getType());
            }
        }
    }

    private void handleCheckoutSessionCompleted(StripeObject stripeObject) {
        Session session = (Session) stripeObject;

        if (session.getMode().equals("subscription")) {
            String subscriptionId = session.getSubscription();
            String tier = session.getMetadata().get("tier");

            if (tier == null) {
                log.warn("Missing tier metadata in checkout.session.completed for session {}", session.getId());
                return;
            }

            Subscription subscription = getSubscriptionBySubscriptionId(subscriptionId);

            if (subscription == null) {
                log.error("Subscription retrieval failed, cannot update metadata");
                return;
            }

            try {
                SubscriptionUpdateParams updateParams = SubscriptionUpdateParams.builder()
                        .putMetadata("tier", tier)
                        .build();
                subscription.update(updateParams);
            } catch (StripeException e) {
                log.error("Error putting metadata tier {} into subscription param with id {}", tier, subscriptionId, e);
            }
        }
    }

    private void handleSubscriptionCreated(StripeObject stripeObject) {
        Subscription subscription = (Subscription) stripeObject;
        String customerId = subscription.getCustomer();
        User user = userRepository.findByStripeCustomerId(customerId).orElseThrow(() -> new EntityNotFoundException("User not found with customer id " + customerId));

        String tier = subscription.getMetadata().get("tier");

        if(tier == null){
            log.warn("Missing tier metadata in customer.subscription.created for subscription {}", subscription.getId());
            return;
        }

        SubscriptionItem item = subscription.getItems().getData().get(0);

        dev.young.backend.entity.Subscription sub = dev.young.backend.entity.Subscription.builder()
                .id(subscription.getId())
                .user(user)
                .plan(item.getPlan().getNickname())
                .tier(tier)
                .status(subscription.getStatus())
                .currentPeriodStart(item.getCurrentPeriodStart())
                .currentPeriodEnd(item.getCurrentPeriodEnd())
                .build();

        user.setSubscription(sub);

        subscriptionRepository.save(sub);
    }

    private void handleSubscriptionUpdated(StripeObject stripeObject) {
        Subscription subscription = (Subscription) stripeObject;
        dev.young.backend.entity.Subscription existingSub = subscriptionRepository.findById(subscription.getId()).orElseThrow(() -> new EntityNotFoundException("Subscription not found wid id " + subscription));

        String tier = subscription.getMetadata() != null ? subscription.getMetadata().get("tier") : existingSub.getTier();

        SubscriptionItem item = subscription.getItems().getData().get(0);

        existingSub.setTier(tier);
        existingSub.setPlan(item.getPlan().getNickname());
        existingSub.setStatus(subscription.getStatus());
        existingSub.setCurrentPeriodStart(item.getCurrentPeriodStart());
        existingSub.setCurrentPeriodEnd(item.getCurrentPeriodStart());
        subscriptionRepository.save(existingSub);
    }

    private void handleSubscriptionDeleted(StripeObject stripeObject) {
        Subscription subscription = (Subscription) stripeObject;
        dev.young.backend.entity.Subscription existingSub = subscriptionRepository.findById(subscription.getId()).orElseThrow(() -> new EntityNotFoundException("Subscription not found wid id " + subscription));

        existingSub.setStatus("canceled");
        subscriptionRepository.save(existingSub);
    }

    private String getStripeCustomerId(User user) {
        if (user.getStripeCustomerId() != null) {
            return user.getStripeCustomerId();
        }

        RequestOptions options = RequestOptions.builder()
                .setIdempotencyKey(UUID.randomUUID().toString())
                .setStripeAccount(stripeClientId)
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

    private Subscription getSubscriptionBySubscriptionId(String subscriptionId) {
        try {
            return Subscription.retrieve(subscriptionId);
        } catch (StripeException e) {
            log.error("Error retrieving subscription with id {}", subscriptionId, e);
            return null;
        }
    }
}