
    // Initialize EmailJS
    (function() {
      // Replace these with your actual EmailJS credentials
      emailjs.init("dbnF2C9SXMjf9iICe"); // Get from EmailJS dashboard
    })();

    // Star Rating System
    const stars = document.querySelectorAll('.star');
    const ratingText = document.getElementById('ratingText');
    const ratingInput = document.getElementById('rating');
    let currentRating = 0;

    const ratingTexts = {
      0: 'Click to rate',
      1: 'Poor - Needs significant improvement',
      2: 'Fair - Below expectations', 
      3: 'Good - Meets expectations',
      4: 'Very Good - Exceeds expectations',
      5: 'Excellent - Outstanding!'
    };

    stars.forEach(star => {
      star.addEventListener('click', () => {
        currentRating = parseInt(star.dataset.rating);
        ratingInput.value = currentRating;
        updateStarRating();
      });

      star.addEventListener('mouseenter', () => {
        const hoverRating = parseInt(star.dataset.rating);
        highlightStars(hoverRating);
      });
    });

    document.getElementById('starRating').addEventListener('mouseleave', () => {
      updateStarRating();
    });

    function highlightStars(rating) {
      stars.forEach((star, index) => {
        if (index < rating) {
          star.classList.add('active');
        } else {
          star.classList.remove('active');
        }
      });
      ratingText.textContent = ratingTexts[rating];
    }

    function updateStarRating() {
      highlightStars(currentRating);
    }

    // Collect device/browser info
    document.getElementById('user_agent').value = navigator.userAgent;
    document.getElementById('timestamp').value = new Date().toISOString();

    // Form Submission
    document.getElementById('feedbackForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submitBtn');
      const loadingSpinner = document.getElementById('loadingSpinner');
      const successMessage = document.getElementById('successMessage');
      const errorMessage = document.getElementById('errorMessage');
      
      // Hide previous messages
      successMessage.style.display = 'none';
      errorMessage.style.display = 'none';
      
      // Show loading state
      submitBtn.disabled = true;
      loadingSpinner.style.display = 'inline-block';
      submitBtn.innerHTML = '<div class="loading-spinner"></div> Sending...';
      
      // Prepare email data
      const templateParams = {
        user_name: document.getElementById('user_name').value,
        user_email: document.getElementById('user_email').value,
        subject: document.getElementById('subject').value,
        rating: currentRating + ' ⭐',
        message: document.getElementById('message').value,
        user_agent: document.getElementById('user_agent').value,
        timestamp: new Date().toLocaleString(),
        to_email: 'trashinsta.offecial@gmail.com'
      };

      // Send email using EmailJS
      emailjs.send("service_trashinsta","template_qfssaw8", templateParams)
        .then(function(response) {
          console.log('SUCCESS!', response.status, response.text);
          
          // Show success message
          successMessage.style.display = 'block';
          
          // Reset form
          document.getElementById('feedbackForm').reset();
          currentRating = 0;
          ratingInput.value = 0;
          updateStarRating();
          
          // Scroll to success message
          successMessage.scrollIntoView({ behavior: 'smooth' });
          
        }, function(error) {
          console.log('FAILED...', error);
          
          // Show error message
          errorMessage.style.display = 'block';
          errorMessage.scrollIntoView({ behavior: 'smooth' });
        })
        .finally(function() {
          // Reset button state
          submitBtn.disabled = false;
          loadingSpinner.style.display = 'none';
          submitBtn.innerHTML = '🚀 Send Feedback';
        });
    });

    // Alternative fallback using Formspree (if EmailJS doesn't work)
    function sendViaFormspree(formData) {
      fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      })
      .then(response => {
        if (response.ok) {
          document.getElementById('successMessage').style.display = 'block';
          document.getElementById('feedbackForm').reset();
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('errorMessage').style.display = 'block';
      });
    }