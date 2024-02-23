#! /usr/bin/env bash

platforms=("linux/arm64" "linux/amd64")
package_name=$(jq -r '.name' package.json)
package_version=$(jq -r '.version' package.json)

# Build the project
echo "Building the project..."
npm install
npm run build

# Sync capacitor
echo "Syncing capacitor..."
# npx cap add android
# npx cap sync

# Build the android app
echo "Building the android app..."
# npx cap open android

# Build the ios app
echo "Building the ios app..."
# npx cap open ios

# Build the docker image
echo "Building the docker images..."

for platform in ${platforms[@]}; do
  echo "Building docker image for: $platform."

  tag=$(echo "${platform//\//_}" | tr -d 'linux_' | xargs -I {} echo {})

  podman build --no-cache --pull \
    --platform $platform \
    -t kennycallado/$package_name:${package_version}-${tag} \
    -f ./Containerfile .

  # Push the docker images
  echo "Pushing the image..."
  podman push kennycallado/$package_name:${package_version}-${tag}
done

# Create the manifest
echo "Creating the manifest for the version: $package_version"
podman manifest create kennycallado/${package_name}:${package_version}

echo "Adding the images to the manifest..."
for platform in ${platforms[@]}; do
  tag=$(echo "${platform//\//_}" | tr -d 'linux_' | xargs -I {} echo {})
  podman manifest add --arch ${platform#*/} kennycallado/${package_name}:${package_version} kennycallado/${package_name}:${package_version}-${tag}
done

echo "Creating the latest manifest..."
podman manifest create kennycallado/${package_name}:latest

echo "Adding the images to the manifest..."
for platform in ${platforms[@]}; do
  tag=$(echo "${platform//\//_}" | tr -d 'linux_' | xargs -I {} echo {})
  podman manifest add --arch ${platform#*/} kennycallado/${package_name}:latest kennycallado/${package_name}:${package_version}-${tag}
done

# push the manifests
echo "Pushing the manifests..."
podman manifest push --rm kennycallado/${package_name}:${package_version} docker://kennycallado/${package_name}:${package_version}
podman manifest push --rm kennycallado/${package_name}:latest docker://kennycallado/${package_name}:latest

# remove the images
echo "Removing the images..."
podman rmi kennycallado/${package_name}:${package_version}-amd64
podman rmi kennycallado/${package_name}:${package_version}-arm64

# remove the manifest
echo "Cleaning up the manifest..."
podman system prune -f

exit 0
