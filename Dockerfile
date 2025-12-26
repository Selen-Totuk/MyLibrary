FROM mcr.microsoft.comdotnetsdk8.0 AS build
WORKDIR src
COPY [MyLibrary.csproj, .]
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o apppublish

FROM mcr.microsoft.comdotnetaspnet8.0
WORKDIR app
COPY --from=build apppublish .
COPY library.db . 
ENTRYPOINT [dotnet, MyLibrary.dll]