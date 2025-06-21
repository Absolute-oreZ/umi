package dev.young.backend.dto.exception;

public class NotGroupMemberException extends RuntimeException {
    public NotGroupMemberException(String username, String groupName) {
        super(username + " is not a member in the group " + groupName);
    }
}