package dev.young.backend.dto.exception;

public class NotGroupAdminException extends RuntimeException {
    public NotGroupAdminException(String groupName) {
        super("You are not an admin for the group " + groupName);
    }
}