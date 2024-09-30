#If the folder exists, remove it first, then copy the files
if [ -d "./../../ExpressApps/BakeryServer/docs" ]; then

    rm -rv ./../../ExpressApps/BakeryServer/docs/*
    cp -v build/* ./../../ExpressApps/BakeryServer/docs/

#Else make a new folder and then move the files.
else
    mkdir -p ./../../ExpressApps/BakeryServer/docs
    cp -v build/* ./../../ExpressApps/BakeryServer/docs/
fi