@echo off
REM ============================================================
REM  Declenche un deploiement de l'application sur Dokploy.
REM
REM  Double-cliquez sur ce fichier, ou lancez-le depuis un terminal :
REM
REM      deploy-dokploy.bat
REM
REM  La cle d'API est lue dans le fichier .env.local, a cote de ce
REM  script (variable DOKPLOY_API_KEY). Ce fichier n'est pas suivi par
REM  git : le depot etant public, la cle ne doit jamais apparaitre dans
REM  le code.
REM
REM      DOKPLOY_API_KEY=votre_cle_ici
REM
REM  Une variable d'environnement du meme nom est prioritaire.
REM
REM  Sans accents volontairement : la console Windows n'utilise pas
REM  UTF-8 par defaut et les afficherait de travers.
REM ============================================================

setlocal

set "URL_DEPLOIEMENT=https://dokploy.acerom-app-service.com/api/application.deploy"

REM L'identifiant de l'application n'est pas un secret : seul son
REM appairage avec la cle d'API permet de lancer un deploiement.
set "APPLICATION_ID=dOOepo39k6nO4CbWNPil5"
if defined DOKPLOY_APPLICATION_ID set "APPLICATION_ID=%DOKPLOY_APPLICATION_ID%"

set "FICHIER_ENV=%~dp0.env.local"

REM Si le script a ete lance par double-clic, on garde la fenetre
REM ouverte a la fin pour que le resultat reste lisible.
set "INTERACTIF="
echo %cmdcmdline% | find /i "%~nx0" >nul 2>&1 && set "INTERACTIF=1"

where curl >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] La commande curl est introuvable.
    echo          Elle est fournie avec Windows 10 et 11 : verifiez que
    echo          C:\Windows\System32 figure bien dans le PATH.
    goto :fin_erreur
)

REM --- Lecture de la cle d'API ---------------------------------
set "CLE_API=%DOKPLOY_API_KEY%"

if not defined CLE_API (
    if not exist "%FICHIER_ENV%" (
        echo [ERREUR] Fichier introuvable : %FICHIER_ENV%
        echo          Creez-le et ajoutez-y la ligne :
        echo          DOKPLOY_API_KEY=votre_cle
        goto :fin_erreur
    )
    for /f "usebackq eol=# tokens=1,* delims==" %%A in ("%FICHIER_ENV%") do (
        if /i "%%A"=="DOKPLOY_API_KEY" set "CLE_API=%%B"
    )
)

REM Retire d'eventuels guillemets autour de la valeur.
if defined CLE_API set "CLE_API=%CLE_API:"=%"

if not defined CLE_API (
    echo [ERREUR] DOKPLOY_API_KEY introuvable dans %FICHIER_ENV%
    echo          Ajoutez-y la ligne : DOKPLOY_API_KEY=votre_cle
    goto :fin_erreur
)

REM --- Appel de l'API ------------------------------------------
echo Deploiement de l'application %APPLICATION_ID% sur Dokploy...
echo.

REM --fail-with-body : un refus fait echouer le script tout en affichant
REM   le message de Dokploy, sinon une erreur passerait inapercue.
REM --post301/302/303 : si le serveur repond par une redirection, curl
REM   transformerait sinon le POST en GET et rien ne serait deploye.
curl --fail-with-body --silent --show-error --location ^
     --post301 --post302 --post303 ^
     --max-time 60 ^
     --request POST ^
     --header "x-api-key: %CLE_API%" ^
     --header "Content-Type: application/json" ^
     --data "{\"applicationId\": \"%APPLICATION_ID%\"}" ^
     "%URL_DEPLOIEMENT%"

if errorlevel 1 (
    echo.
    echo.
    echo [ERREUR] Le deploiement n'a pas ete declenche.
    echo          Si le message ci-dessus parle d'authentification, la cle
    echo          est invalide ou expiree : regenerez-la dans Dokploy, puis
    echo          remplacez DOKPLOY_API_KEY dans .env.local
    goto :fin_erreur
)

echo.
echo.
echo [OK] Deploiement declenche.
goto :fin_ok

:fin_erreur
if defined INTERACTIF pause
endlocal
exit /b 1

:fin_ok
if defined INTERACTIF pause
endlocal
exit /b 0
