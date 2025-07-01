package dev.young.backend.repository;

import dev.young.backend.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription,String> {
    Optional<Subscription> findByStripeSubscriptionId(String stripeSubscriptionId);
}