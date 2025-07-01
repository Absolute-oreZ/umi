package dev.young.backend.controller;

import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import dev.young.backend.service.StripeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Slf4j
@RestController
@RequestMapping("/api/v1/stripe")
@RequiredArgsConstructor
@Tag(name = "Stripe")
public class StripeController {

    @Value("${spring.profiles.active}")
    private String activeProfile;

    @Value("${application.stripe.webhook-secret}")
    private String stripeWebhookSecret;

    private final StripeService stripeService;

    @PostMapping("/subscription-checkout-session")
    public ResponseEntity<Map<String, String>> createSubscriptionCheckoutSession(
            Authentication authentication,
            @RequestParam String plan) {
        return ResponseEntity.ok(Map.of("url", stripeService.createSubscriptionCheckOutSession(authentication, plan)));
    }

    @PostMapping("/subscription-portal-session")
    public ResponseEntity<Map<String, String>> createSubscriptionPortalSession(Authentication authentication) {
        return ResponseEntity.ok(Map.of("url", stripeService.createPortalSession(authentication)));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> processStripeEvents(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        Event event = null;
        try {
            event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);
        } catch (StripeException e) {
            log.error("Error parsing webhook request {}", e.getMessage(), e);
            return ResponseEntity.status(BAD_REQUEST).body(null);
        }

        stripeService.processEvent(event);

        return ResponseEntity.ok("Success");
    }
}