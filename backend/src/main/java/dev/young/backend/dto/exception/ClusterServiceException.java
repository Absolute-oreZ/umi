package dev.young.backend.dto.exception;

public class ClusterServiceException extends RuntimeException{
    public ClusterServiceException(String message){
        super(message);
    }
}