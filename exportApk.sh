rm -rf android/app/build/outputs/apk/*
cd android
./gradlew assembleRelease
cd ..