pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    APP_DIR = 'lymon-backend'
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
        dir("${APP_DIR}") {
          sh 'corepack prepare pnpm@10.33.0 --activate'
          sh 'pnpm install --frozen-lockfile'
        }
      }
    }

    stage('Run Tests') {
      steps {
        dir("${APP_DIR}") {
          sh 'pnpm run test:cov'
        }
      }
    }

    stage('SonarQube Scan') {
      steps {
        dir("${APP_DIR}") {
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
        reportDir: "${APP_DIR}/coverage/lcov-report",
        reportFiles: 'index.html',
        reportName: 'Backend Coverage',
        keepAll: true,
        allowMissing: true
      ])
    }
  }
}
