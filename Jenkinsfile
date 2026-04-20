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
        withSonarQubeEnv('SonarQube') {
          script {
            def scannerHome = tool 'SonarScanner'
            sh """
              ${scannerHome}/bin/sonar-scanner \
                -Dproject.settings=${WORKSPACE}/${APP_DIR}/sonar-project.properties \
                -Dsonar.projectBaseDir=${WORKSPACE}/${APP_DIR}
            """
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
