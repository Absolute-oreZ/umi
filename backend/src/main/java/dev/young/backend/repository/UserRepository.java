package dev.young.backend.repository;

import dev.young.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User,UUID> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

//    @Query("SELECT u.id FROM User u WHERE u.stripeCustomerId = :stripeCustomerId")
//    Optional<UUID> findUserIdByStripeCustomerId(String stripeCustomerId);
    Optional<User> findByStripeCustomerId(String stripeCustomerId);
}