# Último Maletín

26 maletines, una decisión final. Juego web inspirado en Deal or No Deal, con estética azul oscuro y dorado, maletines con relieve y ofertas de la banca.

## Jugar

Elige tu maletín y abre los demás en nueve rondas. Al final de cada ronda, acepta la oferta de la banca o sigue jugando. Si llegas a los dos últimos maletines, puedes conservar el tuyo o cambiarlo.

- Diseño adaptable a celulares y escritorio.
- Suspenso antes de cada apertura, llamadas de la banca, efectos visuales y confeti al terminar.
- Sonidos originales sintetizados con Web Audio; control de silencio persistente.
- Navegación por teclado, diálogos accesibles y respeto a la preferencia de movimiento reducido.
- Sin cuentas, apuestas, pagos ni premios reales. El dinero es ficticio.

## Desarrollo local

Requiere Node.js 18 o superior. No hay dependencias que instalar.

```sh
npm start
```

Abre http://127.0.0.1:4173. Para comprobar las reglas del juego: `npm test`.

## GitHub Pages

En **Settings → Pages**, selecciona **Deploy from a branch**, rama **main**, carpeta **/ (root)** y guarda. La dirección será https://joaqx3wa.github.io/Ultimo-Maletin/ una vez termine la publicación. Todos los recursos usan rutas relativas.

## Recursos

Maletines y efectos visuales creados con CSS; iconos SVG propios. Todos los sonidos son originales y se sintetizan en el navegador, sin archivos externos ni grabaciones de terceros. Tipografías DM Sans y Playfair Display mediante Google Fonts (SIL Open Font License), con alternativas del sistema si no hay conexión.

Proyecto independiente, sin afiliación con el programa televisivo ni sus titulares.
