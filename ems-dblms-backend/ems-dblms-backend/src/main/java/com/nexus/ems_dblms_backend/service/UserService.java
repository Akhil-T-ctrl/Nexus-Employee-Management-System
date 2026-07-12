package com.nexus.ems_dblms_backend.service;

import com.nexus.ems_dblms_backend.dto.UpdateEmployeeRequest;
import com.nexus.ems_dblms_backend.dto.UserResponse;
import com.nexus.ems_dblms_backend.exception.ResourceNotFoundException;
import com.nexus.ems_dblms_backend.mapper.UserResponseMapper;
import com.nexus.ems_dblms_backend.model.User;
import com.nexus.ems_dblms_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {


    private final UserRepository userRepository;
    private final UserResponseMapper userResponseMapper;
    private final PasswordEncoder passwordEncoder;


    public User getUserDetails(Long employeeId){
        return userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    public UserResponse updateEmployeeDetailsByAdmin(Long employeeId, UpdateEmployeeRequest request){
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() ->new ResourceNotFoundException("no such employee found"));

        employee.setUsername(request.username());
        employee.setPassword(passwordEncoder.encode(request.password()));
        employee.setFullName(request.fullName());

        User employeeUpdated = userRepository.save(employee);

        return userResponseMapper.toResponseDTO(employeeUpdated);
    }
}
