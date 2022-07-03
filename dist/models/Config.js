"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplateRss = exports.rssConfig = void 0;
const database_1 = require("./database");
const fs_1 = require("fs");
exports.rssConfig = new database_1.KeyJSONDB(process.env.BOKSKOG_LOCAL + "rss.json", {
    "title": "Bokskog",
    "description": "Self hosted audiobook library",
    "image": "https://photos.kallers.se/1080h/_MK23095.jpg",
    "lang": "en-us",
    "link": "https://new.kallers.se/"
});
exports.rssConfig.load();
const rssDefaultTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
    <channel>
        <title>{{title}}</title>
        <description>{{description}}</description>
        <itunes:image href="{{image}}" />
        <language>{{lang}}</language>
        <link>{{link}}</link>
        <image>
            <link>{{link}}</link>
            <title>{{title}}</title>
            <url>{{image}}</url>
        </image>
        {{#audiobooks}}
        <item>
            <title>{{name}}</title>
            <enclosure url="{{url}}" length="0" />
        </item>
        {{/audiobooks}}
    </channel>
</rss>`;
const getTemplateRss = () => {
    try {
        return (0, fs_1.readFileSync)(process.env.BOKSKOG_LOCAL + "rss.mustache", 'utf8');
    }
    catch (error) {
        try {
            (0, fs_1.writeFileSync)(String(process.env.BOKSKOG_LOCAL + "rss.mustache"), rssDefaultTemplate, 'utf8');
            return (0, fs_1.readFileSync)(process.env.BOKSKOG_LOCAL + "rss.mustache", 'utf8');
        }
        catch (error) {
            return rssDefaultTemplate;
        }
    }
};
exports.getTemplateRss = getTemplateRss;
const data = (0, exports.getTemplateRss)();
console.log(data);
