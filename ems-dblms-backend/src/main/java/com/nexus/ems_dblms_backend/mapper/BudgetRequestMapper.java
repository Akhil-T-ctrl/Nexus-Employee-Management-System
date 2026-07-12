package com.nexus.ems_dblms_backend.mapper;

import com.nexus.ems_dblms_backend.dto.BudgetResponse;
import com.nexus.ems_dblms_backend.model.BudgetRequest;
import org.springframework.stereotype.Component;

@Component
public class BudgetRequestMapper {

    public BudgetResponse toResponseDTO(BudgetRequest request) {
        if (request == null) {
            return null;
        }

        Long empId = (request.getEmployee() != null) ? request.getEmployee().getId() : null;
        String empName = (request.getEmployee() != null) ? request.getEmployee().getFullName() : "Unknown Employee";

        Long deptId = (request.getDepartment() != null) ? request.getDepartment().getId() : null;
        String deptName = (request.getDepartment() != null) ? request.getDepartment().getName() : "Unassigned Department";

        return new BudgetResponse(
                request.getId(),
                request.getAmount(),
                request.getStatus() != null ? request.getStatus().name() : null, // Handles your BudgetStatus enum conversion
                empId,
                empName,
                deptId,
                deptName,
                request.getDescription(),
                request.getTitle()
        );
    }
}
