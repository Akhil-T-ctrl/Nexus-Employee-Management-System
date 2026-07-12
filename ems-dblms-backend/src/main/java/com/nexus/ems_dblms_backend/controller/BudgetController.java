package com.nexus.ems_dblms_backend.controller;

import com.nexus.ems_dblms_backend.dto.BudgetResponse;
import com.nexus.ems_dblms_backend.dto.BudgetSubmissionRequest;
import com.nexus.ems_dblms_backend.mapper.BudgetRequestMapper;
import com.nexus.ems_dblms_backend.model.BudgetRequest;
import com.nexus.ems_dblms_backend.model.BudgetStatus;
import com.nexus.ems_dblms_backend.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final BudgetRequestMapper budgetRequestMapper;

    @PostMapping("/submit")
    public ResponseEntity<BudgetResponse> submitBudget(
            @RequestBody BudgetSubmissionRequest request,
            @RequestParam Long employeeId) {
        BudgetRequest budgetRequest = budgetService.createRequest(request, employeeId);
        return ResponseEntity.ok(budgetRequestMapper.toResponseDTO(budgetRequest));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<BudgetResponse>> getMyRequests(@RequestParam Long employeeId) {
         List<BudgetRequest> requests = budgetService.getEmployeeRequests(employeeId);
         return ResponseEntity.ok(requests.stream()
                                            .map(budgetRequestMapper::toResponseDTO)
                                            .collect(Collectors.toList()));
    }

    @PutMapping("/manage/review/{requestId}")
    public ResponseEntity<BudgetResponse> reviewRequest(
            @PathVariable Long requestId,
            @RequestParam BudgetStatus status) {
        BudgetRequest budgetRequest = budgetService.updateStatus(requestId, status);
        return ResponseEntity.ok(budgetRequestMapper.toResponseDTO(budgetRequest));
    }


}
