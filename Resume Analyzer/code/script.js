document.getElementById('resumeForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const fileInput = document.getElementById('resumeInput');
    const jobDescription = document.getElementById('jobDescription').value.trim();
  
    if (fileInput.files.length === 0) {
      alert('Please select a resume file to upload.');
      return;
    }
  
    if (!jobDescription) {
      alert('Please paste the job description.');
      return;
    }
  
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
  
    const outputDiv = document.getElementById('output');
    const suggestionsDiv = document.getElementById('suggestions');
    outputDiv.textContent = 'Analyzing your resume...';
    suggestionsDiv.textContent = '';
  
    try {
      // Call Affinda's Resume Parsing API
      const response = await fetch('https://api.affinda.com/v2/resumes', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer aff_c1e0acc49c926fc6df1be3a7139ce3e200b9232d',
        },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to analyze the resume. Please try again.');
      }
  
      const data = await response.json();
      displayAnalysis(data);
      analyzeKeywords(data, jobDescription);
    } catch (error) {
      outputDiv.textContent = `Error: ${error.message}`;
    }
  });
  
  function displayAnalysis(data) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = ''; // Clear previous results
  
    if (!data?.data) {
      outputDiv.textContent = 'No data found in the resume.';
      return;
    }
  
    const { education, skills, workExperience } = data.data;
  
    let resultHTML = '<h3>Resume Analysis Results:</h3>';
  
    // Parse education details
    if (education && education.length > 0) {
      resultHTML += `<p><strong>Education:</strong> ${education
        .map((edu) => edu.organization || 'Unknown Institution')
        .join(', ')}</p>`;
    } else {
      resultHTML += '<p><strong>Education:</strong> Not provided</p>';
    }
  
    // Parse skills
    if (skills && skills.length > 0) {
      resultHTML += `<p><strong>Skills:</strong> ${skills
        .map((skill) => skill.name.toLowerCase())
        .join(', ')}</p>`;
    }
  
    // Parse work experience
    if (workExperience && workExperience.length > 0) {
      resultHTML += `<p><strong>Work Experience:</strong> ${workExperience
        .map((exp) => exp.jobTitle || 'Unknown Position')
        .join(', ')}</p>`;
    }
  
    outputDiv.innerHTML = resultHTML;
  }
  
  function analyzeKeywords(data, jobDescription) {
    const suggestionsDiv = document.getElementById('suggestions');
  
    if (!data?.data?.skills || data.data.skills.length === 0) {
      suggestionsDiv.textContent = 'No skills found in the resume for keyword analysis.';
      return;
    }
  
    const resumeKeywords = data.data.skills.map((skill) => skill.name.toLowerCase());
    const jobKeywords = jobDescription.toLowerCase().split(/[\s,]+/);
  
    const missingKeywords = jobKeywords.filter(
      (keyword) => !resumeKeywords.includes(keyword.trim())
    );
  
    let suggestionsHTML = '<h3>Suggestions for Improvement:</h3>';
    if (missingKeywords.length > 0) {
      suggestionsHTML += `
        <p><strong>Missing Keywords:</strong> ${missingKeywords.join(', ')}</p>
        <p>Consider adding these keywords to your resume to better match the job description.</p>
      `;
    } else {
      suggestionsHTML += '<p>Your resume matches well with the job description!</p>';
    }
  
    suggestionsDiv.innerHTML = suggestionsHTML;
  }
  