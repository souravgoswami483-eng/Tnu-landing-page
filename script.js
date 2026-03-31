document.addEventListener('DOMContentLoaded', () => {

    /* ========== NAVBAR SCROLL & MOBILE TOGGLE ========== */
    const navbar = document.getElementById('navbar');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                if (window.scrollY > 50) {
                    navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
                    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                } else {
                    navbar.style.boxShadow = 'none';
                    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                }
                scrollTimeout = null;
            }, 100);
        }
    }, { passive: true });

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    /* ========== SCROLL ANIMATIONS (INTERSECTION OBSERVER) ========== */
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(element => {
        revealOnScroll.observe(element);
    });

    /* ========== ENHANCED FORM VALIDATION & SUBMISSION ========== */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;

    const forms = [
        { id: 'admissionForm', fields: ['name', 'email', 'phone', 'course', 'city'] },
        { id: 'popupInquiryForm', fields: ['popupName', 'popupEmail', 'popupPhone', 'popupCourse'] }
    ];

    // Helper to show/hide errors
    const toggleError = (field, message = '', show = true) => {
        const group = field.closest('.form-group');
        if (!group) return;

        let errorEl = group.querySelector('.error-message');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            group.appendChild(errorEl);
        }

        if (show) {
            group.classList.add('has-error');
            errorEl.textContent = message;
        } else {
            group.classList.remove('has-error');
            errorEl.textContent = '';
        }
        return !show;
    };

    const validateOne = (field) => {
        const value = field.value.trim();
        const id = field.id;

        if (field.hasAttribute('required') && !value) {
            return toggleError(field, 'This field is required');
        }

        if (id.toLowerCase().includes('name')) {
            if (!nameRegex.test(value)) return toggleError(field, 'Please enter a valid name (letters only, min 2 chars)');
        } else if (id.toLowerCase().includes('email')) {
            if (!emailRegex.test(value)) return toggleError(field, 'Please enter a valid email address');
        } else if (id.toLowerCase().includes('phone')) {
            if (!phoneRegex.test(value)) return toggleError(field, 'Please enter a valid 10-digit mobile number');
        } else if (field.tagName === 'SELECT') {
            if (!value) return toggleError(field, 'Please select an option');
        } else if (id.toLowerCase().includes('city')) {
            if (value.length < 2) return toggleError(field, 'City name is too short');
        }

        return toggleError(field, '', false);
    };

    // Auto-populate from localStorage
    const populateFromStorage = () => {
        const storedName = localStorage.getItem('user_name');
        const storedEmail = localStorage.getItem('user_email');
        const storedPhone = localStorage.getItem('user_phone');

        forms.forEach(formData => {
            const formEl = document.getElementById(formData.id);
            if (!formEl) return;

            formEl.querySelectorAll('input').forEach(input => {
                if (input.id.toLowerCase().includes('name') && storedName) input.value = storedName;
                if (input.id.toLowerCase().includes('email') && storedEmail) input.value = storedEmail;
                if (input.id.toLowerCase().includes('phone') && storedPhone) input.value = storedPhone;
            });
        });
    };

    // Apply validation to each form
    forms.forEach(formData => {
        const formEl = document.getElementById(formData.id);
        if (!formEl) return;

        // Input Filtering (Real-time masking)
        formEl.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                // Remove error on type
                toggleError(input, '', false);

                // Masking and Persistence
                if (input.type === 'tel') {
                    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 10);
                    localStorage.setItem('user_phone', input.value);
                } else if (input.id.toLowerCase().includes('name')) {
                    input.value = input.value.replace(/[^a-zA-Z\s]/g, '');
                    localStorage.setItem('user_name', input.value);
                } else if (input.id.toLowerCase().includes('email')) {
                    localStorage.setItem('user_email', input.value);
                }
            });

            input.addEventListener('blur', () => validateOne(input));
        });

        formEl.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', () => validateOne(select));
        });

        // Submission
        formEl.addEventListener('submit', (e) => {
            e.preventDefault();

            let isValid = true;
            formEl.querySelectorAll('input, select').forEach(field => {
                if (!validateOne(field)) isValid = false;
            });

            if (!isValid) {
                // Scroll to first error
                const firstError = formEl.querySelector('.has-error');
                if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            // Mock Submission UI
            const btn = formEl.querySelector('.btn-submit');
            const originalText = btn.innerHTML;
            const originalBg = btn.style.backgroundColor;
            
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            btn.style.pointerEvents = 'none';

            // Simulate server response
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Success! Sent.';
                btn.style.backgroundColor = '#10b981';
                btn.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.5)';
                
                // Clear storage on success? (Optional, maybe keep it for UX)
                // localStorage.clear(); 
                
                formEl.reset();

                // If popup form, close after a delay
                if (formData.id === 'popupInquiryForm') {
                    setTimeout(() => {
                        const overlay = document.getElementById('popupOverlay');
                        if (overlay) {
                            overlay.classList.remove('active');
                            document.body.style.overflow = 'auto';
                            sessionStorage.setItem('popupClosed', 'true');
                        }
                    }, 2000);
                }
                
                // Revert button after 4 seconds
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.backgroundColor = originalBg;
                    btn.style.boxShadow = '';
                    btn.style.pointerEvents = 'auto';
                }, 4000);
            }, 1800);
        });
    });

    populateFromStorage();

    /* ========== 1-MINUTE POPUP LOGIC ========== */
    const popupOverlay = document.getElementById('popupOverlay');
    const closePopupBtn = document.getElementById('closePopup');

    if (popupOverlay) {
        // Show popup after 1 minute
        setTimeout(() => {
            if (!sessionStorage.getItem('popupClosed')) {
                popupOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }, 60000);

        // Show popup on all "Apply Now" buttons
        const applyBtns = document.querySelectorAll('a[href="#apply"]');
        applyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                popupOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const closePopupAction = () => {
            popupOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            sessionStorage.setItem('popupClosed', 'true');
        };

        if (closePopupBtn) closePopupBtn.addEventListener('click', closePopupAction);

        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) closePopupAction();
        });
    }
});
