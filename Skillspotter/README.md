# SkillSpotter

## AI-Powered Resume Analyzer and Job Matching Platform

SkillSpotter is a cloud-native web application designed to intelligently match job seekers with relevant employment opportunities using automated skill extraction and serverless computing technologies. The platform leverages a hybrid cloud architecture that combines traditional EC2 hosting with serverless components to deliver a scalable, cost-effective solution for the modern job search ecosystem.

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [CloudFormation Deployment](#cloudformation-deployment)
- [Monitoring](#monitoring)
- [Contributing](#contributing)

## Architecture

SkillSpotter implements a hybrid cloud architecture with these key components:

![alt text](image.png)

### Frontend Tier
- **EC2 Instance**: Hosts the React-based frontend in Docker container
- **Public VPC**: Houses the EC2 instance with proper security group configuration
- **Elastic IP**: Provides stable public access point

### API Layer
- **API Gateway**: RESTful endpoints for authentication, job management, and resume processing

### Compute & Processing
- **Lambda Functions**:
  - Auth Lambda: User authentication and session management
  - Job Management Lambda: Job listing and search functionality
  - Resume Processor Lambda: Extract text and skills from resumes
  - Job Processor Lambda: Analyze job descriptions and identify skills

### Data Storage
- **DynamoDB Tables**:
  - Users Table: Authentication and profile information
  - Jobs Table: Job listings and requirements
  - Resumes Table: Resume metadata and extracted data
  - SkillMatches Table: Job-resume match scores

- **S3 Buckets**:
  - Resume Bucket: Raw resume file storage
  - Job Description Bucket: Job description JSON files

### Analytics & Notifications
- **AWS Glue**: Skill gap analysis and market trends
- **SNS**: User notifications about matches and recommendations
- **CloudWatch**: Comprehensive monitoring dashboards

## Features

- **Automated Resume Analysis**: Extract skills using Amazon Textract
- **Skill Matching Algorithm**: Match resumes with jobs based on skill compatibility
- **User Dashboard**: Track job matches and skill recommendations
- **Job Posting Management**: Admin interface for posting and managing jobs
- **Real-time Notifications**: Email updates about new matches
- **Skill Gap Analysis**: Recommendations for skill improvement
- **Responsive Design**: Access from any device

## Technologies

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Python (Lambda), Node.js
- **Database**: Amazon DynamoDB
- **Storage**: Amazon S3
- **AI/ML**: Amazon Textract, Custom Matching Algorithms
- **Infrastructure**: AWS CloudFormation, Docker
- **Monitoring**: Amazon CloudWatch
- **Communication**: Amazon SNS

## Installation

### Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Docker (for local development)
- Node.js and npm

### Local Development Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/skillspotter.git
cd skillspotter
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Run the frontend locally
```bash
npm start
```

4. Build Docker image
```bash
docker build -t skillspotter-frontend .
```

## Usage

### User Flow

1. **Registration/Login**: Create an account or sign in
2. **Resume Upload**: Upload your resume for skill extraction
3. **Job Browsing**: View jobs matching your skill profile
4. **Skill Analysis**: Review skill gap reports and recommendations

### Admin Flow

1. **Job Management**: Create, edit, and remove job postings
2. **User Management**: View and manage user accounts
3. **Analytics Dashboard**: Review platform statistics and trends

## CloudFormation Deployment

### Deploying the Stack

1. Validate the CloudFormation template
```bash
aws cloudformation validate-template --template-body file://skillspotter.yaml
```

2. Create the CloudFormation stack
```bash
aws cloudformation create-stack \
  --stack-name SkillSpotter \
  --template-body file://skillspotter.yaml \
  --capabilities CAPABILITY_IAM \
  --parameters ParameterKey=KeyPairName,ParameterValue=YOUR_KEY_PAIR
```

3. Monitor the stack creation
```bash
aws cloudformation describe-stacks --stack-name SkillSpotter
```

### Updating the Stack

```bash
aws cloudformation update-stack \
  --stack-name SkillSpotter \
  --template-body file://skillspotter.yaml \
  --capabilities CAPABILITY_IAM
```

## Monitoring

The application includes three CloudWatch dashboards:

1. **Main Dashboard**: Overview of all system components
2. **Resume Processing Dashboard**: Focused on resume upload and analysis
3. **Job Management Dashboard**: Job posting and matching metrics

Access these dashboards via the AWS Management Console under CloudWatch > Dashboards.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

