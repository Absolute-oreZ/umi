package dev.young.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

@Configuration
public class ShellCommandConfig {

    @Value("${spring.profiles.active}")
    private String activeProfile;
    @Value("${server.port}")
    private String port;

    public static String whSec = null;

    @Bean
    CommandLineRunner commandLineRunner() {
        if (activeProfile.equals("dev")) {
            return args -> {
                Process process = getProcess();

                BufferedReader bf = new BufferedReader(new InputStreamReader(process.getInputStream()));
                String line;
                int index = -1;
                while ((line = bf.readLine()) != null) {
                    index = line.lastIndexOf("whsec_");
                    if (index != -1) {
                        whSec = line.substring(index);
                        break;
                    }
                }
            };
        } else {
            return null;
        }
    }

    private Process getProcess() throws IOException {
        ProcessBuilder processBuilder = new ProcessBuilder();

        String events = "checkout.session.completed,customer.subscription.created,customer.subscription.deleted,customer.subscription.paused,customer.subscription.pending_update_applied,customer.subscription.pending_update_expired,customer.subscription.resumed,customer.subscription.trial_will_end,customer.subscription.updated";
        String endpoint = "localhost:" + port + "/api/v1/stripe/webhook";
        String stripePath = "F:\\dev\\installation\\Stripe\\stripe.exe";

        processBuilder.command(stripePath, "listen", "--events", events, "--forward-to", endpoint);

        return processBuilder.start();
    }
}