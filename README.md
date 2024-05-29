# YuGi-BOT-MD

Este repositorio contiene el código fuente del YuGi-BOT para WhatsApp. Sigue las instrucciones a continuación para instalar y configurar el bot.

## Requisitos previos

- Termux instalado en tu dispositivo Android.
- Conexión a Internet estable.

## Comandos de instalación

1. Configura el almacenamiento en Termux:
    ```sh
    termux-setup-storage
    ```

2. Actualiza e instala los paquetes necesarios:
    ```sh
    apt update && apt upgrade && pkg update && pkg upgrade
    pkg install bash libwebp git nodejs ffmpeg wget imagemagick yarn -y
    ```

3. Clona el repositorio de YuGi-BOT:
    ```sh
    git clone https://github.com/Eliasar54/YuGi-BOT-MD.git && cd YuGi-BOT-MD && yarn && npm install
    ```

4. Inicia el bot:
    ```sh
    npm start
    ```

## Activar en caso de detenerse en Termux

Si después de instalar el bot y Termux se detiene (pantalla en blanco, pérdida de conexión a Internet, reinicio del dispositivo), sigue estos pasos:

1. Abre Termux y navega al directorio del bot:
    ```sh
    cd YuGi-BOT-MD
    ```

2. Inicia el bot nuevamente:
    ```sh
    npm start
    ```

## Obtener otro código QR en Termux

Para obtener un nuevo código QR, sigue estos pasos:

1. Detén el bot presionando `CTRL` + `Z` en tu teclado y luego presiona `Enter`.
2. Navega al directorio del bot y elimina la sesión anterior:
    ```sh
    cd
    cd YuGi-BOT-MD
    rm -rf sessions
    ```

3. Inicia el bot nuevamente:
    ```sh
    npm start
    ```

## Actualizar YuGi-BOT-MD

Para actualizar YuGi-BOT-MD automáticamente, usa el siguiente comando:
```sh
grep -q 'bash\|wget' <(dpkg -l) || apt install -y bash wget && wget -O - https://raw.githubusercontent.com/elrebelde21/NovaBot-MD/master/update.sh | bashEste comando hará un respaldo de tu archivo database.json y lo agregará a la versión más reciente del bot.Advertencia: Estos comandos solo funcionan en Termux, Replit, y Linux.Activar el bot 24/7 (Termux)Para mantener el bot activo 24/7, usa los siguientes comandos:npm i -g pm2 && pm2 start index.js && pm2 save && pm2 logsInformación adicionalGrupo de soporte: WhatsApp GroupImagen de perfil: �Número del creador: +50582340051Perfil del creador: GitHub - Eliasar54¡Disfruta usando YuGi-BOT-MD
