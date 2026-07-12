package com.nexus.ems_dblms_backend.mapper;

import com.nexus.ems_dblms_backend.dto.BudgetResponse;
import com.nexus.ems_dblms_backend.dto.UserResponse;
import com.nexus.ems_dblms_backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserResponseMapper {

    private final BudgetRequestMapper budgetRequestMapper; // Re-use the brand-new mapper!

    public UserResponse toResponseDTO(User user) {
        if (user == null) {
            return null;
        }

        Long deptId = (user.getDepartment() != null) ? user.getDepartment().getId() : null;
        String deptName = (user.getDepartment() != null) ? user.getDepartment().getName() : "Unassigned";

        // Transform the collection beautifully using the standard Stream mapping pattern
        List<BudgetResponse> requestDTOs = Collections.emptyList();
        if (user.getBudgetRequests() != null) {
            requestDTOs = user.getBudgetRequests().stream()
                    .map(budgetRequestMapper::toResponseDTO) // High performance component reuse
                    .collect(Collectors.toList());
        }

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getDesignation(),
                user.getRole().name(),
                deptId,
                deptName
        );
    }
}
