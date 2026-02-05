document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        
        const participantsList = details.participants.length > 0
          ? `<ul class="participants-list">${details.participants.map(p => `<li>${p}</li>`).join("")}</ul>`
          : "<p class='no-participants'>No participants yet</p>";

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h5>Participants:</h5>
            ${participantsList}
          </div>
        `;

        activitiesList.appendChild(activityCard);
        
          // Recreate the participants section with delete buttons
          const participantsSection = activityCard.querySelector(".participants-section");
          if (details.participants.length > 0) {
            const participantsContainer = document.createElement("div");
            participantsContainer.className = "participants-container";
          
            details.participants.forEach(participant => {
              const participantItem = document.createElement("div");
              participantItem.className = "participant-item";
              participantItem.innerHTML = `
                <span>${participant}</span>
                <button class="delete-btn" data-activity="${name}" data-email="${participant}" title="Delete participant">✕</button>
              `;
              participantsContainer.appendChild(participantItem);
            });
          
            const h5 = participantsSection.querySelector("h5");
            participantsSection.innerHTML = "";
            participantsSection.appendChild(h5);
            participantsSection.appendChild(participantsContainer);
          }

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
          await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

    // Handle delete button clicks
    document.addEventListener("click", async (event) => {
      const deleteBtn = event.target.closest(".delete-btn");
      if (!deleteBtn) return;

      const activity = deleteBtn.dataset.activity;
      const email = deleteBtn.dataset.email;

      try {
        const response = await fetch(
          `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          await fetchActivities();
        } else {
          const result = await response.json();
          console.error("Failed to unregister:", result.detail);
        }
      } catch (error) {
        console.error("Error unregistering:", error);
      }
    });

  // Initialize app
  fetchActivities();
});
