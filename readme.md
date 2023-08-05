# Bokskog
Bokskog is a very simple self host audiobook streaming, enabling steaming to your favoriate podcast app.
## How does it work?
You put your audiobooks in a folder, thereafter bokskog scans that folder, creating a custom podcast RSS feed. It has no interface or app, instead a podcast RSS feed, enabling you to use any podcast app to stream to.
```
 - Title A
   - part1.mp3
   - part2.mp3
 - Title B
    - audiobook.mp3
```


## Quick start
This is not yet exactly very user friendly, will require you to have node/npm and typescript installed, some knowledge on JSON files is helpful too, as all configs are done by them. You will need to port forward to let a podcast app reach bokskog.
```
git clone https://github.com/kaller01/Bokskog.git
cd Bokskog
npm install
npm run build
npm run start
```
If it starts, great! If not, well...
### Enviorment
The first step is to look at the `.env` file.  
`BOKSKOG_CONFIG` is path to where you want your configs to be stored.  
`BOKSKOG_PUBLIC` should be the domain that bokskog will create links with.   
`BOKSKOG_LIBRARY` should point to where your audiobooks are stored, currently it only accepts the folder as the name of the audiobook and the containing files will be merged to one during streaming.
## Configuration
Currently, no interface exists, so you will have to use the REST api to configure or edit the JSON files.
### JSON configs
`audiobooks.json` is the library of audiobooks. Here you can edit titles and such.  
`rss.json` is to change the contents of the RSS feed, for more control, see the `rss.mustache`.
`users.json` is where the very simple user auth token as well as permissions of user exists.
### API
#### Audiobook `/api/<auth-token>/audiobook/`
GET `/api/<auth-token>/audiobook/rss`
#### Admin `/api/<auth-token>/admin/`
GET `/api/<auth-token>/admin/<name>` (Create a new user)
