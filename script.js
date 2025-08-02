 
     let currentMode = 'yearly';
        let savedData = {};

        function switchMode(mode) {
            currentMode = mode;
            
            // Update active button
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Hide all mode contents
            document.querySelectorAll('.mode-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Show selected mode content
            document.getElementById(`${mode}-mode`).style.display = 'block';
            
            // Hide results
            document.getElementById('results').classList.remove('show');
        }

        function generateSemesterInputs() {
            const numSubjects = parseInt(document.getElementById('sem-subjects').value) || 0;
            const container = document.getElementById('semester-inputs');
            container.innerHTML = '';
            
            for (let i = 1; i <= numSubjects; i++) {
                const item = document.createElement('div');
                item.className = 'subject-item';
                item.innerHTML = `
                    <input type="text" class="input-field" placeholder="Subject ${i} Name" id="sem-sub-name-${i}">
                    <input type="number" class="input-field" placeholder="Marks /100" id="sem-marks-${i}" min="0" max="100">
                    <input type="number" class="input-field" placeholder="Credits" id="sem-credits-${i}" min="1" max="10">
                `;
                container.appendChild(item);
            }
        }

        function generateSubjectInputs() {
            const numSubjects = parseInt(document.getElementById('num-subjects').value) || 0;
            const container = document.getElementById('subject-inputs');
            container.innerHTML = '';
            
            for (let i = 1; i <= numSubjects; i++) {
                const item = document.createElement('div');
                item.className = 'subject-item';
                item.innerHTML = `
                    <input type="text" class="input-field" placeholder="Subject ${i} Name" id="sub-name-${i}">
                    <input type="number" class="input-field" placeholder="Marks /100" id="sub-marks-${i}" min="0" max="100">
                    <input type="number" class="input-field" placeholder="Credits" id="sub-credits-${i}" min="1" max="10" value="3">
                `;
                container.appendChild(item);
            }
        }

        function generateCGPAInputs() {
            const numSemesters = parseInt(document.getElementById('num-semesters').value) || 0;
            const container = document.getElementById('cgpa-inputs');
            container.innerHTML = '';
            
            for (let i = 1; i <= numSemesters; i++) {
                const item = document.createElement('div');
                item.className = 'subject-item';
                item.innerHTML = `
                    <input type="text" class="input-field" placeholder="Semester ${i}" value="Semester ${i}" readonly>
                    <input type="number" class="input-field" placeholder="SGPA" id="cgpa-sgpa-${i}" min="0" max="10" step="0.01">
                    <input type="number" class="input-field" placeholder="Credits" id="cgpa-credits-${i}" min="1" max="30">
                `;
                container.appendChild(item);
            }
        }

        function marksToGradePoint(marks) {
            if (marks >= 90) return 10;
            else if (marks >= 80) return 9;
            else if (marks >= 70) return 8;
            else if (marks >= 60) return 7;
            else if (marks >= 50) return 6;
            else if (marks >= 40) return 5;
            else return 0;
        }

        function getGrade(gpa) {
            if (gpa >= 9) return { grade: 'A+', class: 'grade-A' };
            else if (gpa >= 8) return { grade: 'A', class: 'grade-A' };
            else if (gpa >= 7) return { grade: 'B+', class: 'grade-B' };
            else if (gpa >= 6) return { grade: 'B', class: 'grade-B' };
            else if (gpa >= 5) return { grade: 'C', class: 'grade-C' };
            else return { grade: 'D', class: 'grade-D' };
        }

        function showLoading() {
            document.getElementById('loading').classList.add('show');
        }

        function hideLoading() {
            setTimeout(() => {
                document.getElementById('loading').classList.remove('show');
            }, 500);
        }

        function calculate() {
            showLoading();
            
            setTimeout(() => {
                let results = '';
                
                switch(currentMode) {
                    case 'yearly':
                        results = calculateYearly();
                        break;
                    case 'semester':
                        results = calculateSemester();
                        break;
                    case 'cgpa':
                        results = calculateCGPA();
                        break;
                    case 'target':
                        results = calculateTarget();
                        break;
                }
                
                if (results) {
                    document.getElementById('results-content').innerHTML = results;
                    document.getElementById('results').classList.add('show');
                }
                
                hideLoading();
            }, 600);
        }

        function calculateYearly() {
            const oddSGPA = parseFloat(document.getElementById('odd-sgpa').value) || 0;
            const evenSGPA = parseFloat(document.getElementById('even-sgpa').value) || 0;
            const oddCredits = parseFloat(document.getElementById('odd-credits').value) || 0;
            const evenCredits = parseFloat(document.getElementById('even-credits').value) || 0;
            
            if (oddSGPA === 0 || evenSGPA === 0 || oddCredits === 0 || evenCredits === 0) {
                alert('Please fill all fields!');
                return '';
            }
            
            const ygpa = ((oddSGPA * oddCredits) + (evenSGPA * evenCredits)) / (oddCredits + evenCredits);
            const percentage = (ygpa - 0.75) * 10;
            const gradeInfo = getGrade(ygpa);
            
            return `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${ygpa.toFixed(2)}</div>
                        <div class="stat-label">YGPA</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${percentage.toFixed(2)}%</div>
                        <div class="stat-label">Percentage</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${oddCredits + evenCredits}</div>
                        <div class="stat-label">Total Credits</div>
                    </div>
                </div>
                <div class="result-item">
                    <span class="result-label">Grade</span>
                    <span class="grade-badge ${gradeInfo.class}">${gradeInfo.grade}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(ygpa/10)*100}%"></div>
                </div>
                ${generateTips(ygpa)}
            `;
        }

        function calculateSemester() {
            const numSubjects = parseInt(document.getElementById('sem-subjects').value) || 0;
            if (numSubjects === 0) {
                alert('Please enter number of subjects!');
                return '';
            }
            
            let totalCredits = 0;
            let weightedSum = 0;
            let totalMarks = 0;
            let obtainedMarks = 0;
            
            for (let i = 1; i <= numSubjects; i++) {
                const marks = parseFloat(document.getElementById(`sem-marks-${i}`).value) || 0;
                const credits = parseFloat(document.getElementById(`sem-credits-${i}`).value) || 0;
                
                if (marks === 0 || credits === 0) {
                    alert('Please fill all subject details!');
                    return '';
                }
                
                const gradePoint = marksToGradePoint(marks);
                weightedSum += gradePoint * credits;
                totalCredits += credits;
                totalMarks += 100;
                obtainedMarks += marks;
            }
            
            const sgpa = weightedSum / totalCredits;
            const percentage = (sgpa - 0.75) * 10;
            const gradeInfo = getGrade(sgpa);
            
            return `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${sgpa.toFixed(2)}</div>
                        <div class="stat-label">SGPA</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${percentage.toFixed(2)}%</div>
                        <div class="stat-label">Percentage</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${obtainedMarks}/${totalMarks}</div>
                        <div class="stat-label">Total Marks</div>
                    </div>
                </div>
                <div class="result-item">
                    <span class="result-label">Grade</span>
                    <span class="grade-badge ${gradeInfo.class}">${gradeInfo.grade}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(sgpa/10)*100}%"></div>
                </div>
                ${generateTips(sgpa)}
            `;
        }

        function calculateSubject() {
            // Removed - Subject-wise calculator not needed
        }

        function calculateCGPA() {
            const numSemesters = parseInt(document.getElementById('num-semesters').value) || 0;
            if (numSemesters === 0) {
                alert('Please enter number of semesters!');
                return '';
            }
            
            let totalCredits = 0;
            let weightedSum = 0;
            let semesterDetails = '<h4 style="margin-bottom: 15px; color: var(--dark);">Semester-wise Performance:</h4>';
            
            for (let i = 1; i <= numSemesters; i++) {
                const sgpa = parseFloat(document.getElementById(`cgpa-sgpa-${i}`).value) || 0;
                const credits = parseFloat(document.getElementById(`cgpa-credits-${i}`).value) || 0;
                
                if (sgpa === 0 || credits === 0) {
                    alert('Please fill all semester details!');
                    return '';
                }
                
                weightedSum += sgpa * credits;
                totalCredits += credits;
                
                const gradeInfo = getGrade(sgpa);
                semesterDetails += `
                    <div class="result-item">
                        <span class="result-label">Semester ${i}</span>
                        <span>SGPA: ${sgpa} - <span class="grade-badge ${gradeInfo.class}" style="font-size: 0.9rem; padding: 4px 12px;">${gradeInfo.grade}</span></span>
                    </div>
                `;
            }
            
            const cgpa = weightedSum / totalCredits;
            const percentage = (cgpa - 0.75) * 10;
            const gradeInfo = getGrade(cgpa);
            
            return semesterDetails + `
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${cgpa.toFixed(2)}</div>
                        <div class="stat-label">CGPA</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${percentage.toFixed(2)}%</div>
                        <div class="stat-label">Percentage</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${totalCredits}</div>
                        <div class="stat-label">Total Credits</div>
                    </div>
                </div>
                <div class="result-item">
                    <span class="result-label">Overall Grade</span>
                    <span class="grade-badge ${gradeInfo.class}">${gradeInfo.grade}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(cgpa/10)*100}%"></div>
                </div>
                ${generateTips(cgpa)}
            `;
        }

        function calculateTarget() {
            const currentCGPA = parseFloat(document.getElementById('current-cgpa').value) || 0;
            const currentCredits = parseFloat(document.getElementById('current-credits').value) || 0;
            const targetCGPA = parseFloat(document.getElementById('target-cgpa').value) || 0;
            const nextCredits = parseFloat(document.getElementById('next-credits').value) || 0;
            
            if (currentCGPA === 0 || currentCredits === 0 || targetCGPA === 0 || nextCredits === 0) {
                alert('Please fill all fields!');
                return '';
            }
            
            if (targetCGPA < currentCGPA) {
                return `
                    <div class="tips-card">
                        <div class="tips-title">⚠️ Notice</div>
                        <p>Your target CGPA is lower than your current CGPA. You're already above your target!</p>
                    </div>
                `;
            }
            
            const currentPoints = currentCGPA * currentCredits;
            const totalCreditsAfter = currentCredits + nextCredits;
            const requiredPoints = targetCGPA * totalCreditsAfter;
            const requiredSGPA = (requiredPoints - currentPoints) / nextCredits;
            
            let feasibility = '';
            let feasibilityClass = '';
            
            if (requiredSGPA > 10) {
                feasibility = 'Not Possible';
                feasibilityClass = 'grade-D';
            } else if (requiredSGPA > 9) {
                feasibility = 'Very Difficult';
                feasibilityClass = 'grade-C';
            } else if (requiredSGPA > 8) {
                feasibility = 'Challenging';
                feasibilityClass = 'grade-B';
            } else if (requiredSGPA > 7) {
                feasibility = 'Achievable';
                feasibilityClass = 'grade-A';
            } else {
                feasibility = 'Easily Achievable';
                feasibilityClass = 'grade-A';
            }
            
            return `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${requiredSGPA > 10 ? '10+' : requiredSGPA.toFixed(2)}</div>
                        <div class="stat-label">Required SGPA</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${currentCGPA}</div>
                        <div class="stat-label">Current CGPA</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${targetCGPA}</div>
                        <div class="stat-label">Target CGPA</div>
                    </div>
                </div>
                <div class="result-item">
                    <span class="result-label">Feasibility</span>
                    <span class="grade-badge ${feasibilityClass}">${feasibility}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min((requiredSGPA/10)*100, 100)}%"></div>
                </div>
                ${generateTargetTips(requiredSGPA, feasibility)}
            `;
        }

        function generateTips(gpa) {
            let tips = '';
            if (gpa >= 9) {
                tips = `
                    <div class="tips-card">
                        <div class="tips-title">🎉 Excellent Performance!</div>
                        <p>Outstanding work! You're in the top tier. Consider mentoring others and exploring advanced courses.</p>
                    </div>
                `;
            } else if (gpa >= 8) {
                tips = `
                    <div class="tips-card">
                        <div class="tips-title">👍 Great Job!</div>
                        <p>You're doing very well! Focus on consistency and aim for that 9+ GPA in upcoming semesters.</p>
                    </div>
                `;
            } else if (gpa >= 7) {
                tips = `
                    <div class="tips-card">
                        <div class="tips-title">💪 Good Progress!</div>
                        <p>Solid performance! Consider spending more time on challenging subjects to push into the 8+ range.</p>
                    </div>
                `;
            } else if (gpa >= 6) {
                tips = `
                    <div class="tips-card">
                        <div class="tips-title">📚 Room for Improvement</div>
                        <p>You're on track but can do better! Try creating a study schedule and seek help in difficult subjects.</p>
                    </div>
                `;
            } else {
                tips = `
                    <div class="tips-card">
                        <div class="tips-title">🎯 Action Needed</div>
                        <p>Time to step up your game! Consider meeting with professors, joining study groups, and improving study habits.</p>
                    </div>
                `;
            }
            return tips;
        }

        function generateTargetTips(requiredSGPA, feasibility) {
            let tips = '';
            if (feasibility === 'Not Possible') {
                tips = `
                    <div class="tips-card">
                        <div class="tips-title">🎯 Adjust Your Target</div>
                        <p>Your target might be too ambitious for one semester. Consider:</p>
                        <ul style="margin-top: 10px; padding-left: 20px;">
                            <li>Setting a more realistic short-term goal</li>
                            <li>Planning improvements over multiple semesters</li>
                            <li>Taking additional courses to increase total credits</li>
                        </ul>
                    </div>
                `;
            } else if (feasibility === 'Very Difficult') {
                tips = `
                    <div class="tips-card">
                        <div class="tips-title">⚡ High Performance Required</div>
                        <p>This will require exceptional effort:</p>
                        <ul style="margin-top: 10px; padding-left: 20px;">
                            <li>Dedicate significant study time daily</li>
                            <li>Seek help from professors and TAs</li>
                            <li>Form study groups with top performers</li>
                            <li>Consider dropping challenging electives if possible</li>
                        </ul>
                    </div>
                `;
            } else if (feasibility === 'Challenging') {
                tips = `
                    <div class="tips-card">
                        <div class="tips-title">💪 Strong Effort Needed</div>
                        <p>Achievable with dedicated effort:</p>
                        <ul style="margin-top: 10px; padding-left: 20px;">
                            <li>Create a structured study schedule</li>
                            <li>Focus extra attention on weaker subjects</li>
                            <li>Attend all classes and participate actively</li>
                            <li>Start assignments early</li>
                        </ul>
                    </div>
                `;
            } else {
                tips = `
                    <div class="tips-card">
                        <div class="tips-title">🎉 Achievable Goal!</div>
                        <p>Your target is within reach with consistent effort:</p>
                        <ul style="margin-top: 10px; padding-left: 20px;">
                            <li>Maintain your current study habits</li>
                            <li>Stay organized and manage time well</li>
                            <li>Don't get complacent - consistency is key</li>
                        </ul>
                    </div>
                `;
            }
            return tips;
        }

        function reset() {
            // Clear all input fields
            document.querySelectorAll('.input-field').forEach(field => {
                field.value = '';
            });
            
            // Clear dynamic inputs
            document.getElementById('semester-inputs').innerHTML = '';
            document.getElementById('cgpa-inputs').innerHTML = '';
            
            // Hide results
            document.getElementById('results').classList.remove('show');
        }

        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        e.preventDefault();
                        calculate();
                        break;
                    case 'r':
                        e.preventDefault();
                        reset();
                        break;
                }
            }
        });

        // Add input validation
        document.addEventListener('input', function(e) {
            if (e.target.classList.contains('input-field')) {
                const field = e.target;
                const value = parseFloat(field.value);
                
                // Validate GPA/SGPA fields
                if (field.id.includes('sgpa') || field.id.includes('cgpa') || field.max === '10') {
                    if (value > 10) {
                        field.style.borderColor = 'var(--danger)';
                        field.title = 'Value cannot exceed 10';
                    } else if (value < 0) {
                        field.style.borderColor = 'var(--danger)';
                        field.title = 'Value cannot be negative';
                    } else {
                        field.style.borderColor = '#e2e8f0';
                        field.title = '';
                    }
                }
                
                // Validate marks fields
                if (field.id.includes('marks') || field.max === '100') {
                    if (value > 100) {
                        field.style.borderColor = 'var(--danger)';
                        field.title = 'Marks cannot exceed 100';
                    } else if (value < 0) {
                        field.style.borderColor = 'var(--danger)';
                        field.title = 'Marks cannot be negative';
                    } else {
                        field.style.borderColor = '#e2e8f0';
                        field.title = '';
                    }
                }
            }
        });

        // Initialize tooltips and help text
        document.addEventListener('DOMContentLoaded', function() {
            // Add help tooltips
            const helpTexts = {
                'yearly-mode': 'Calculate yearly GPA from odd and even semester SGPAs',
                'semester-mode': 'Calculate semester GPA from individual subject marks',
                'cgpa-mode': 'Calculate cumulative GPA from multiple semesters',
                'target-mode': 'Find required SGPA to achieve target CGPA'
            };
            
            Object.keys(helpTexts).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.title = helpTexts[id];
                }
            });
        });   
       
       
       