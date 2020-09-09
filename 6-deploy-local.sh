sam build
cd .aws-sam/build/avgtempinsfax
echo installing node dependencies
npm install 
cd ../../../
cd .aws-sam/build/currenttempincovilha
echo installing node dependencies
npm install 
cd ../../../
echo starting API server locally
sam local start-api