package com.nexus.ems_dblms_backend.mapper;

import com.nexus.ems_dblms_backend.dto.DepartmentResponse;
import com.nexus.ems_dblms_backend.model.Department;
import org.springframework.stereotype.Component;


@Component
public class DepartmentMapper {
    public DepartmentResponse toResponseDTO(Department department) {
        if (department == null) {
            return null;
        }

        Long managerId = (department.getManager() != null) ? department.getManager().getId() : null;
        String managerName = (department.getManager() != null) ? department.getManager().getFullName() : "No Manager Assigned";

        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                managerId,
                managerName,
                department.getMaxBudget(),
                department.getRemainingBudget()
        );
    }
}
