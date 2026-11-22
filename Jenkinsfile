
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

        stage('Build Docker Images') {
            steps {
                sh 'docker build -t contacthub-backend ./backend'
                sh 'docker build -t contacthub-frontend --build-arg VITE_API_URL= ./frontend'
            }
        }

        stage('Push Docker Images to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    sh '''
                        echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USER" --password-stdin

                        docker tag contacthub-backend:latest "$DOCKERHUB_USER/contacthub-backend:latest"
                        docker tag contacthub-frontend:latest "$DOCKERHUB_USER/contacthub-frontend:latest"

                        docker push "$DOCKERHUB_USER/contacthub-backend:latest"
                        docker push "$DOCKERHUB_USER/contacthub-frontend:latest"

                        docker logout
                    '''
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
