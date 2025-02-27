# !bin/bash

# This script is used to generate a commit message for a git commit.
echo "Ingrese numero de ticket:"
read type
echo "Ingrese descripcion del commit: "
read description

commitgen $type $scope $subject $description
