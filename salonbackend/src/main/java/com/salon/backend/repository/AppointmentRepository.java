package com.salon.backend.repository;

import com.salon.backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {


    List<Appointment> findByDate(String date);

    List<Appointment> findByService(String service);

    List<Appointment> findByDateAndService(String date, String service);

    List<Appointment> findByNameContainingIgnoreCaseOrPhoneContaining(
            String name,
            String phone
    );

}


