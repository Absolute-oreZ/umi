package dev.young.backend.dto.exception;

public class NotGroupMemberException extends RuntimeException {
    public NotGroupMemberException(String learnerName, String groupName) {
        super(learnerName + " is not a member in the group " + groupName);
    }
}