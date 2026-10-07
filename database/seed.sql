-- Sample rows for manual testing ONLY.
-- Never imported by the frontend and not referenced anywhere in the app code.

USE research_portal;

INSERT INTO opportunities
    (title, description, research_area, faculty_name, department,
     required_skills, positions_available, application_deadline, status)
VALUES
    ('Machine Learning for Medical Imaging',
     'Develop deep learning models for early detection of retinal diseases from fundus images.',
     'Artificial Intelligence', 'Dr. Ayesha Khan', 'Computer Science',
     'Python, TensorFlow, PyTorch, CNN, Data Preprocessing', 3, '2026-12-15', 'Open'),

    ('Renewable Energy Grid Optimization',
     'Model and optimize load balancing strategies for a campus-scale solar microgrid.',
     'Energy Systems', 'Dr. Imran Sheikh', 'Electrical Engineering',
     'MATLAB, Simulink, Optimization, Power Systems', 2, '2026-11-30', 'Open'),

    ('Sentiment Analysis of Social Media Data',
     'Build NLP pipelines to track public sentiment around climate policy discussions.',
     'Natural Language Processing', 'Dr. Sara Malik', 'Data Science',
     'Python, NLP, Hugging Face, Pandas, Web Scraping', 4, '2026-10-20', 'Closed');
