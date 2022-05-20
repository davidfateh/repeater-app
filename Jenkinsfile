pipeline {
  agent { label 'dind' }
  options {
    skipStagesAfterUnstable()
    buildDiscarder logRotator(artifactDaysToKeepStr: '5', artifactNumToKeepStr: '30', daysToKeepStr: '5', numToKeepStr: '30')
  }

  // Remove the build arg after we fully move to v2
  parameters {
    string(defaultValue: '095413357796', description: 'AWS Account ID', name: 'ACCOUNT_ID')
    string(defaultValue: "us-east-2", description: 'AWS Region', name: 'AWS_REGION')
    string(defaultValue: 'pensieve', description: 'ECR Registry Repos', name: 'REGISTRY_REPOS')
    string(defaultValue: ".", description: 'The source folder where the app is', name: "BASE_CONTEXT")
    string(defaultValue: "./Dockerfile", description: 'The Dockerfile path for building the image (relative to the BASE_CONTEXT)', name: 'DOCKERFILE_PATH')
    string(defaultValue: "", description: 'Docker Build Arguments', name: 'DOCKER_BUILD_ARGS')

  }

  stages {

    stage('Build setup') {
      steps {
        script {
          env = "B&B"
          account_id = params.ACCOUNT_ID
          registry_repos = params.REGISTRY_REPOS
          base_context = params.BASE_CONTEXT
          path_to_dockerfile = params.DOCKERFILE_PATH
          docker_build_args = params.DOCKER_BUILD_ARGS
          git_branch = scm.branches[0].name
          // branch_from_git = ghprbSourceBranch
          // git_branch_dns = "staging-${ghprbPullId}"
          build_number = currentBuild.number
          intermediate_tag = new Date().getTime()
          currentBuild.displayName = "#${currentBuild.number}: ${env} ${registry_repos} ${git_branch}"
        }
      }
    }

    // stage('Send Build Start Notification') {
    //   steps {
    //     script {
    //       slackSend channel: '#deployments',
    //         color: 'good',
    //         message: "pensieve ${git_branch.toUpperCase()} Deployment beginning! <${BUILD_URL}|Open Build>",
    //         teamDomain: 'bollandbranch',
    //         tokenCredentialId: 'deploybot-slack-credentials',
    //         username: "deploybot",
    //         botUser: "false"
    //     }
    //   }
    // }

    stage('Checkout Repository') {
      steps {
        checkout(
          [
            $class: 'GitSCM',
            branches: scm.branches,
            doGenerateSubmoduleConfigurations: false,
            extensions: [
              [
                $class: 'SubmoduleOption',
                disableSubmodules: true,
                // parentCredentials: true,
                // recursiveSubmodules: true,
                // reference: '',
                // trackingSubmodules: false,
                // shallow: true,
                // depth: 1
              ]
              ,[
                $class: 'CloneOption',
                noTags: false,
                shallow: true,
                depth: 1
              ]
            ],
            submoduleCfg: [],
            userRemoteConfigs: [[credentialsId: 'github-ssh-access', url: "${GIT_URL}"]]
          ]
        )
      }
    }

    stage('Get Git SHA for Image name') {
      steps {
        script {
          sh "git rev-parse HEAD > .git/commit-id"
          git_commit_sha = readFile('.git/commit-id').trim()
        }
      }
    }

    stage('ECR Registry Login') {
      steps {
        script {
          sh """
            `aws ecr get-login --no-include-email --region ${AWS_REGION}`
          """
        }
      }
    }

    stage('Build Container') {
      steps {
        script {
          dir(base_context) {
            sh """
              docker build --no-cache -t ${account_id}.dkr.ecr.${AWS_REGION}.amazonaws.com/bollandbranch/${registry_repos}:${git_branch}-${build_number}-${git_commit_sha} ${docker_build_args} -f ${path_to_dockerfile} .
            """
          }
        }
      }
    }

    stage('Push Container') {
      steps {
        script {
          dir(base_context) {
            sh """
              docker push ${account_id}.dkr.ecr.${AWS_REGION}.amazonaws.com/bollandbranch/${registry_repos}:${git_branch}-${build_number}-${git_commit_sha}
            """
          }
        }
      }
    }

    stage('Update App Version in Helm chart') {
      steps {
        script {
          withCredentials([sshUserPrivateKey(credentialsId: 'github-ssh-access', keyFileVariable: 'ID_RSA_PATH', passphraseVariable: '', usernameVariable: 'USERNAME')]) { 
            sh """
              eval `ssh-agent -s`
              ssh-add ${ID_RSA_PATH}

              cd deploy/
              git clone git@github.com:boll-branch/infrastructure.git
              
              mkdir -p infrastructure/kubernetes/\$(if [ $git_branch == "main" ]; then echo "production"; else echo $git_branch; fi)/charts/
              rsync -avI --delete $registry_repos/ infrastructure/kubernetes/\$(if [ $git_branch = "main" ]; then echo "production"; else echo $git_branch; fi)/charts/$registry_repos
              cd infrastructure/
              sed -i "s/^appVersion:.*\$/appVersion: \"$git_branch-$build_number-$git_commit_sha\"/g" ./kubernetes/\$(if [ $git_branch = "main" ]; then echo "production"; else echo $git_branch; fi)/charts/$registry_repos/Chart.yaml
              git --no-pager diff
              
              git config user.name BollandBranch
              git config user.email bot@bollandbranch.com

              git add .
              git commit -m "Gitlab - Argo Deploy $registry_repos $git_branch"
              git push -u origin master


            """
          }
        }
      }
    }

    stage('Send Build End Notification') {
      steps {
        script {
            slackSend channel: '#dev-frontend-deploys',
            color: 'good',
            message: "Pensieve Build Complete: `${git_branch.toUpperCase()}` <${BUILD_URL}|[Build]>",
            teamDomain: 'bollandbranch',
            tokenCredentialId: 'deploybot-slack-credentials',
            username: "deploybot",
            botUser: "false"
        }
      }
    }

  }
   post {
     failure {
       script {
         slackSend channel: '#dev-frontend-deploys',
           color: 'danger',
           message: "Pensieve Build Failure: `${git_branch.toUpperCase()}` <${BUILD_URL}|[Build]>",
           teamDomain: 'bollandbranch',
           tokenCredentialId: 'deploybot-slack-credentials',
           username: "deploybot",
           botUser: "false"
       }
     }
   }
}
