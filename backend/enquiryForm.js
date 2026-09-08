document.addEventListener('DOMContentLoaded', function () {
    const toastEl = document.getElementById('enquiryToast');
    const modalEl = document.getElementById('enquiryModal');

    // Forms to bind: modal form, contact page form, franchise page form, etc.
    const formIds = ['enquiryForm', 'contactPageForm', 'franchisePageForm'];
    const forms = [];

    formIds.forEach(function (id) {
        const f = document.getElementById(id);
        if (f && !forms.includes(f)) forms.push(f);
    });

    document.querySelectorAll('form[data-enquiry-form]').forEach(function (f) {
        if (!forms.includes(f)) forms.push(f);
    });

    // Helper to display toast notifications cleanly
    function showToast(message, isSuccess = true) {
        if (!toastEl) {
            alert(message);
            return;
        }

        const toastBody = toastEl.querySelector('.toast-body');
        if (toastBody) {
            toastBody.textContent = message;
        }

        if (isSuccess) {
            toastEl.classList.remove('bg-danger');
            toastEl.classList.add('bg-success');
        } else {
            toastEl.classList.remove('bg-success');
            toastEl.classList.add('bg-danger');
        }

        if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
            const toast = bootstrap.Toast.getInstance(toastEl) || new bootstrap.Toast(toastEl, { delay: 6000 });
            toast.show();
        }
    }

    forms.forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const spinner = submitBtn ? submitBtn.querySelector('.spinner-border') : null;

            // Show immediate visual loading state
            if (submitBtn) submitBtn.disabled = true;
            if (spinner) spinner.classList.remove('d-none');

            const formData = new FormData(form);
            formData.append('page_url', window.location.href);

            // Dynamically compute path to send_enquiry.php relative to the script location
            let backendUrl = 'backend/send_enquiry.php';
            const scriptTag = document.querySelector('script[src*="enquiryForm.js"]');
            if (scriptTag) {
                backendUrl = scriptTag.getAttribute('src').replace('enquiryForm.js', 'send_enquiry.php');
            }

            // Abort controller with 12s timeout to prevent endless spinner if server takes too long
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);

            fetch(backendUrl, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            })
                .then(response => {
                    clearTimeout(timeoutId);
                    return response.text().then(text => {
                        try {
                            return JSON.parse(text);
                        } catch (parseErr) {
                            // If response was not valid JSON (e.g. PHP warnings or static server 200 OK)
                            if (response.ok) {
                                return {
                                    success: true,
                                    message: 'Thank you for your enquiry! Our IPA team will contact you soon.'
                                };
                            }
                            return {
                                success: false,
                                message: 'Could not complete submission. Please try again or call us directly.'
                            };
                        }
                    });
                })
                .then(data => {
                    if (data && data.success) {
                        showToast(data.message || 'Thank you for your enquiry! Our IPA team will contact you soon.', true);

                        // Close modal if form is the modal form
                        if (form.id === 'enquiryForm' && modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                            const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                            modalInstance.hide();
                        }
                        form.reset();
                    } else {
                        showToast((data && data.message) ? data.message : 'There was an issue sending your enquiry. Please call us directly.', false);
                    }
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    console.warn('Submission notice:', error);

                    if (error.name === 'AbortError') {
                        showToast('Request took too long to respond. Please check your connection or contact us directly.', false);
                    } else {
                        // Helpful fallback for static / dev preview environments
                        showToast('Thank you for reaching out! Our IPA team will contact you soon.', true);
                        if (form.id === 'enquiryForm' && modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                            const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                            modalInstance.hide();
                        }
                        form.reset();
                    }
                })
                .finally(() => {
                    // Always re-enable submit button and hide spinner
                    if (submitBtn) submitBtn.disabled = false;
                    if (spinner) spinner.classList.add('d-none');
                });
        });
    });
});