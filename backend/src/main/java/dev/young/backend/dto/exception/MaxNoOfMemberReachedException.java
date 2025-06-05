package dev.young.backend.dto.exception;

public class MaxNoOfMemberReachedException extends RuntimeException{
    public MaxNoOfMemberReachedException(String groupName){
        super("The group " + groupName + " has reach the maximum no. of members");
    }
}