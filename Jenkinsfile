
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        DOCKERHUB_NAMESPACE = 'devmugisha'
        IMAGE_TAG = "${BUILD_NUMBER}"
        K8S_NAMESPACE = 'contacthub'
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
                sh '''
                    docker build \
                        -t contacthub-backend:${IMAGE_TAG} \
                        ./backend

                    docker build \
                        -t contacthub-frontend:${IMAGE_TAG} \
                        --build-arg VITE_API_URL= \
                        ./frontend
                '''
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
                        set -eu

                        export DOCKER_CONFIG=$(mktemp -d)

                        cleanup() {
                            docker logout >/dev/null 2>&1 || true
                            rm -rf "$DOCKER_CONFIG"
                        }

                        trap cleanup EXIT

                        echo "$DOCKERHUB_TOKEN" | docker login \
                            -u "$DOCKERHUB_USER" \
                            --password-stdin

                        docker tag contacthub-backend:${IMAGE_TAG} \
                            "$DOCKERHUB_USER/contacthub-backend:${IMAGE_TAG}"

                        docker tag contacthub-frontend:${IMAGE_TAG} \
                            "$DOCKERHUB_USER/contacthub-frontend:${IMAGE_TAG}"

                        docker tag contacthub-backend:${IMAGE_TAG} \
                            "$DOCKERHUB_USER/contacthub-backend:latest"

                        docker tag contacthub-frontend:${IMAGE_TAG} \
                            "$DOCKERHUB_USER/contacthub-frontend:latest"

                        docker push "$DOCKERHUB_USER/contacthub-backend:${IMAGE_TAG}"
                        docker push "$DOCKERHUB_USER/contacthub-frontend:${IMAGE_TAG}"

                        docker push "$DOCKERHUB_USER/contacthub-backend:latest"
                        docker push "$DOCKERHUB_USER/contacthub-frontend:latest"
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([
                    credentialsId: 'kubernetes-deployer-config',
                    namespace: 'contacthub'
                ]) {
                    sh '''
                        set -eu

                        echo "Deploying ContactHub build ${IMAGE_TAG}"

                        kubectl set image deployment/backend \
                            backend=${DOCKERHUB_NAMESPACE}/contacthub-backend:${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE}

                        kubectl set image deployment/frontend \
                            frontend=${DOCKERHUB_NAMESPACE}/contacthub-frontend:${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE}

                        echo "Waiting for backend rollout..."

                        kubectl rollout status deployment/backend \
                            -n ${K8S_NAMESPACE} \
                            --timeout=180s

                        echo "Waiting for frontend rollout..."

                        kubectl rollout status deployment/frontend \
                            -n ${K8S_NAMESPACE} \
                            --timeout=180s

                        echo "Final deployment status:"

                        kubectl get deployments -n ${K8S_NAMESPACE}
                        kubectl get pods -n ${K8S_NAMESPACE}
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'ContactHub CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'ContactHub CI/CD pipeline failed. Check the logs.'
        }
    }
}
