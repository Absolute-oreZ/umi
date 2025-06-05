package dev.young.backend.dto.group;

import dev.young.backend.dto.learner.LearnerDTO;
import dev.young.backend.dto.message.MessageDTO;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class GroupDTO {
    private Long id;
    private String name;
    private String about;
    private String iconPath;
    private LearnerDTO admin;
    private int noOfMembers;
    private int noOfOnlineMembers;
    private int noOfUnreadMessages;
    private MessageDTO lastMessage;
    private LocalDateTime createdDate;
    private List<LearnerDTO> members;
}