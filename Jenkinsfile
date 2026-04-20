pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    NODE_ENV = 'test'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        dir('lymon-backend') {
          sh 'corepack prepare pnpm@10.33.0 --activate'
          sh 'pnpm install --frozen-lockfile'
        }
      }
    }

    stage('Run Tests') {
      steps {
        dir('lymon-backend') {
          sh 'pnpm run test:cov'
        }
      }
    }

    stage('SonarQube Scan') {
      steps {
        dir('lymon-backend') {
          withSonarQubeEnv('SonarQube') {
            script {
              def scannerHome = tool 'SonarScanner'
              sh "${scannerHome}/bin/sonar-scanner"
            }
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }
  }

  post {
    always {
      publishHTML(target: [
        reportDir: 'lymon-backend/coverage/lcov-report',
        reportFiles: 'index.html',
        reportName: 'Backend Coverage',
        keepAll: true,
        allowMissing: true
      ])
    }
  }
}
