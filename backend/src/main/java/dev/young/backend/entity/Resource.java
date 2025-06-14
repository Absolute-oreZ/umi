package dev.young.backend.entity;

import dev.young.backend.enums.FileType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Resource extends BaseEntity{
    private String name;
    @Enumerated(EnumType.STRING)
    private FileType category;
    private String resourcePath;
}