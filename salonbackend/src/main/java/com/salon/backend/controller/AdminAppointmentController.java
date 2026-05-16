package com.salon.backend.controller;

import com.salon.backend.entity.Appointment;
import com.salon.backend.repository.AppointmentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/admin/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminAppointmentController {

    private final AppointmentRepository repo;

    public AdminAppointmentController(AppointmentRepository repo) {
        this.repo = repo;
    }

    // ✅ GET all appointments with sorting
    @GetMapping
    public List<Appointment> getAll(
            @RequestParam(defaultValue = "newest") String sort
    ) {

        List<Appointment> list = repo.findAll();

        return sortAppointments(list, sort);
    }

    // ✅ FILTER + SEARCH + SORT
    @GetMapping("/filter")
    public List<Appointment> filter(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String service,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "newest") String sort
    ) {

        List<Appointment> list;

        if (search != null && !search.isEmpty()) {
            list = repo.findByNameContainingIgnoreCaseOrPhoneContaining(search, search);
        }
        else if (date != null && service != null) {
            list = repo.findByDateAndService(date, service);
        }
        else if (date != null) {
            list = repo.findByDate(date);
        }
        else if (service != null) {
            list = repo.findByService(service);
        }
        else {
            list = repo.findAll();
        }

        return sortAppointments(list, sort);
    }

    // ✅ UPDATE STATUS
    @PutMapping("/{id}/status")
    public Appointment updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {

        Appointment a = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        a.setStatus(status.toUpperCase());

        return repo.save(a);
    }

    // 🔥 SORT HELPER
    private List<Appointment> sortAppointments(List<Appointment> list, String sort) {

        switch (sort) {
            case "oldest":
                list.sort(Comparator.comparing(Appointment::getId));
                break;

            case "date_asc":
                list.sort(Comparator.comparing(Appointment::getDate));
                break;

            case "date_desc":
                list.sort(Comparator.comparing(Appointment::getDate).reversed());
                break;

            case "newest":
            default:
                list.sort(Comparator.comparing(Appointment::getId).reversed());
                break;
        }

        return list;
    }
}
