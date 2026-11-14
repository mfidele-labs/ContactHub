
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'ContactHub source code checked out.'
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm ci'
                        }
                    }
                }

                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        stage('Frontend Checks') {
            steps {
                dir('frontend') {
                    sh 'npm run lint'
                    sh 'npm run build'
                }
            }
        }
    }

    post {
        success {
            echo 'ContactHub CI pipeline completed successfully!'
        }

        failure {
            echo 'ContactHub CI pipeline failed. Check the logs.'
        }
    }
}
