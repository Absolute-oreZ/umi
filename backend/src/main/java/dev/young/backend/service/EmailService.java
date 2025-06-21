package dev.young.backend.service;

import dev.young.backend.enums.EmailTemplateName;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import static java.nio.charset.StandardCharsets.*;
import static org.springframework.mail.javamail.MimeMessageHelper.MULTIPART_MODE_MIXED;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final SpringTemplateEngine springTemplateEngine;

    @Async
    public void sendApproveJoinGroupEmail(
            String to,
            String subject,
            String username,
            String groupName,
            String groupsUrl,
            EmailTemplateName emailTemplateName
    ) throws MessagingException, UnsupportedEncodingException {

        String templateName = (emailTemplateName == null)
                ? "group_join_request"
                : emailTemplateName.name();

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, MULTIPART_MODE_MIXED, UTF_8.name());

        Map<String, Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("groupName", groupName);
        properties.put("groupsUrl", groupsUrl);

        Context context = new Context();
        context.setVariables(properties);

        mimeMessageHelper.setFrom(new InternetAddress("no_reply@umi.com", "Yo from umi.dev"));
        mimeMessageHelper.setTo(to);
        mimeMessageHelper.setSubject(subject);

        String template = springTemplateEngine.process(templateName, context);
        mimeMessageHelper.setText(template, true);

        ClassPathResource image = new ClassPathResource("/static/UMI_BOT.png");
        mimeMessageHelper.addInline("umiBot", image);

        javaMailSender.send(mimeMessage);

    }

    @Async
    public void sendRequestAcceptedEmail(
            String to,
            String subject,
            String username,
            String groupName,
            String groupChatUrl,
            EmailTemplateName emailTemplateName
    ) throws MessagingException, UnsupportedEncodingException {
        String templateName = (emailTemplateName == null)
                ? "request_accepted"
                : emailTemplateName.name();

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, MULTIPART_MODE_MIXED, UTF_8.name());

        Map<String, Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("groupName", groupName);
        properties.put("groupChatUrl", groupChatUrl);

        Context context = new Context();
        context.setVariables(properties);

        mimeMessageHelper.setFrom(new InternetAddress("no_reply@umi.com", "Yo from umi.dev"));
        mimeMessageHelper.setTo(to);
        mimeMessageHelper.setSubject(subject);

        String template = springTemplateEngine.process(templateName, context);
        mimeMessageHelper.setText(template, true);

        ClassPathResource image = new ClassPathResource("/static/UMI_BOT.png");
        mimeMessageHelper.addInline("umiBot", image);

        javaMailSender.send(mimeMessage);

    }

    @Async
    public void sendRequestRejectedEmail(
            String to,
            String subject,
            String username,
            String groupName,
            String exploreUrl,
            EmailTemplateName emailTemplateName
    ) throws MessagingException, UnsupportedEncodingException {
        String templateName = (emailTemplateName == null)
                ? "request_accepted"
                : emailTemplateName.name();

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, MULTIPART_MODE_MIXED, UTF_8.name());

        Map<String, Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("groupName", groupName);
        properties.put("exploreUrl", exploreUrl);

        Context context = new Context();
        context.setVariables(properties);

        mimeMessageHelper.setFrom(new InternetAddress("no_reply@umi.com", "Yo from umi.dev"));
        mimeMessageHelper.setTo(to);
        mimeMessageHelper.setSubject(subject);

        String template = springTemplateEngine.process(templateName, context);
        mimeMessageHelper.setText(template, true);

        ClassPathResource image = new ClassPathResource("/static/UMI_BOT.png");
        mimeMessageHelper.addInline("umiBot", image);

        javaMailSender.send(mimeMessage);
    }

    @Async
    public void notifyCreatedEvent(
            String to,
            String subject,
            String username,
            String groupName,
            String eventLink,
            String eventTitle,
            String formattedStartDate,
            String formattedEndDate,
            String eventCreator,
            Integer remindBefore,
            EmailTemplateName emailTemplateName
    ) throws MessagingException, UnsupportedEncodingException {
        String templateName = (emailTemplateName == null)
                ? "new_event"
                : emailTemplateName.name();

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, MULTIPART_MODE_MIXED, UTF_8.name());

        Map<String, Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("groupName", groupName);
        properties.put("eventTitle", eventTitle);
        properties.put("startDate", formattedStartDate);
        properties.put("endDate", formattedEndDate);
        properties.put("eventLink", eventLink);
        properties.put("eventCreator", eventCreator);
        properties.put("remindBefore", remindBefore);

        Context context = new Context();
        context.setVariables(properties);

        mimeMessageHelper.setFrom(new InternetAddress("no_reply@umi.com", "Yo from umi.dev"));
        mimeMessageHelper.setTo(to);
        mimeMessageHelper.setSubject(subject);

        String template = springTemplateEngine.process(templateName, context);
        mimeMessageHelper.setText(template, true);

        ClassPathResource image = new ClassPathResource("/static/UMI_BOT.png");
        mimeMessageHelper.addInline("umiBot", image);

        javaMailSender.send(mimeMessage);
    }

    @Async
    public void notifyEventChanges(
            String to,
            String subject,
            String username,
            String groupName,
            String eventLink,
            String eventTitle,
            String formattedStartDate,
            String formattedEndDate,
            String eventCreator,
            Integer remindBefore,
            Map<String, String> changes,
            EmailTemplateName emailTemplateName
    ) throws MessagingException, UnsupportedEncodingException {
        String templateName = (emailTemplateName == null)
                ? "event_changed"
                : emailTemplateName.name();

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, MULTIPART_MODE_MIXED, UTF_8.name());

        Map<String, Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("groupName", groupName);
        properties.put("eventTitle", eventTitle);
        properties.put("startDate", formattedStartDate);
        properties.put("endDate", formattedEndDate);
        properties.put("eventLink", eventLink);
        properties.put("eventCreator", eventCreator);
        properties.put("remindBefore", remindBefore);
        properties.put("changes", changes);

        Context context = new Context();
        context.setVariables(properties);

        mimeMessageHelper.setFrom(new InternetAddress("no_reply@umi.com", "Yo from umi.dev"));
        mimeMessageHelper.setTo(to);
        mimeMessageHelper.setSubject(subject);

        String template = springTemplateEngine.process(templateName, context);
        mimeMessageHelper.setText(template, true);

        ClassPathResource image = new ClassPathResource("/static/UMI_BOT.png");
        mimeMessageHelper.addInline("umiBot", image);

        javaMailSender.send(mimeMessage);
    }

    @Async
    public void notifyEventCancelled(
            String to,
            String subject,
            String username,
            String groupName,
            String eventTitle,
            EmailTemplateName emailTemplateName
    ) throws MessagingException, UnsupportedEncodingException {
        String templateName = (emailTemplateName == null)
                ? "event_cancelled"
                : emailTemplateName.name();

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, MULTIPART_MODE_MIXED, UTF_8.name());

        Map<String, Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("groupName", groupName);
        properties.put("eventTitle", eventTitle);

        Context context = new Context();
        context.setVariables(properties);

        mimeMessageHelper.setFrom(new InternetAddress("no_reply@umi.com", "Yo from umi.dev"));
        mimeMessageHelper.setTo(to);
        mimeMessageHelper.setSubject(subject);

        String template = springTemplateEngine.process(templateName, context);
        mimeMessageHelper.setText(template, true);

        ClassPathResource image = new ClassPathResource("/static/UMI_BOT.png");
        mimeMessageHelper.addInline("umiBot", image);

        javaMailSender.send(mimeMessage);
    }

}