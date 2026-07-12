package com.nexus.ems_dblms_backend.controller;

import com.nexus.ems_dblms_backend.dto.BudgetResponse;
import com.nexus.ems_dblms_backend.dto.DepartmentResponse;
import com.nexus.ems_dblms_backend.dto.UserResponse;
import com.nexus.ems_dblms_backend.mapper.BudgetRequestMapper;
import com.nexus.ems_dblms_backend.model.BudgetRequest;
import com.nexus.ems_dblms_backend.model.BudgetStatus;
import com.nexus.ems_dblms_backend.service.AuthService;
import com.nexus.ems_dblms_backend.service.BudgetService;
import com.nexus.ems_dblms_backend.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/manager")
public class ManagerController {

    private final DepartmentService departmentService;
    private final AuthService authService;
    private final BudgetService budgetService;
    private final BudgetRequestMapper budgetRequestMapper;

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentResponse>> getAllDepartments(@RequestParam Long managerId){
        return ResponseEntity.ok(departmentService.getAllDepartments(managerId));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsersByManager(@RequestParam Long departmentId){
        return ResponseEntity.ok(authService.getAllUsersByManager(departmentId));
    }

    @GetMapping("/budgets/department")
    public ResponseEntity<List<BudgetResponse>> getDepartmentRequests(@RequestParam Long departmentId) {
        List<BudgetRequest> requests = budgetService.getDepartmentRequests(departmentId);
        return ResponseEntity.ok(requests.stream()
                .map(budgetRequestMapper::toResponseDTO)
                .collect(Collectors.toList()));
    }

    @GetMapping("/departments/{deptId}/requests")
    public ResponseEntity<List<BudgetResponse>> getDepartmentRequests(
            @PathVariable Long deptId,
            @RequestParam BudgetStatus status) {
        List<BudgetRequest> requests = budgetService.getRequestsByDeptAndStatus(deptId, status);
        return ResponseEntity.ok(requests.stream()
                .map(budgetRequestMapper::toResponseDTO)
                .collect(Collectors.toList()));
    }

}
