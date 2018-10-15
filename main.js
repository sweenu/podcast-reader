var crossorigin_url = 'https://cors-anywhere.herokuapp.com/';
var id = 0;

class Playlist {
    constructor() {
        var _playlist = new Map();
        this._playlist = _playlist;

        var _playlist_elem = document.querySelector('#playlist');
        this._playlist_elem = _playlist_elem;
    }

    getFirstElement() {
        var iter_playlist = this._playlist.values();
        return iter_playlist.next().value;
    }

    remove(index) {
        return () => {
            this._playlist.delete(index);
            let media = document.querySelector('#media' + index);
            this._playlist_elem.removeChild(media);
        };
    }
    
    append(media) {
        let button = media._media_elem.querySelector('button');
        button.onclick = this.remove(id);


        this._playlist.set(id, media);
        this._playlist_elem.appendChild(media._media_elem);
        id++;
    }
}

class Media {
    constructor(title, url, type) {
        var _media_elem;

        this.title = title;
        this.url = url;
        this.type = type;

        let media_template = document.querySelector('template');
        _media_elem = document.importNode(media_template.content, true);
        _media_elem.querySelector('.title').innerHTML = title
        _media_elem.firstElementChild.id = 'media' + id
        this._media_elem = _media_elem;
    };
}

class Player {
    constructor() {
        var _player = document.querySelector('video');
        this._player = _player
    }

    loadMedia(media) {
        let source = this._player.querySelector('source');
        source.src = media.url;
        source.type = media.type;
        this._player.load();
    }

    play() {
        this._player.play();
        button = document.querySelector('#play-pause-button');
    }
}

function importFromRSS(playlist, player) {
    return () => {
        var parser, podcast_list;
        var url = document.querySelector('#import-url').value;
        fetch(crossorigin_url + url).then((r) => {
            if (r.status !== 200) {
                alert("Un problème est survenu, vérifiez que l'url rentré pointe "
                      + "vers un fichier XML");
                return;
            }

            parser = new DOMParser();
            r.text().then((data) => {
                podcast_list = parser.parseFromString(data, 'text/xml');
                podcast_list.querySelectorAll('item').forEach((item) => {
                    let title = item.getElementsByTagName("title")[0].childNodes[0].nodeValue;
                    let enclosure = item.getElementsByTagName("enclosure")[0];
                    let url = enclosure.getAttribute('url');
                    let type = enclosure.getAttribute('type');

                    playlist.append(new Media(title, url, type));

                });
            }).catch((err) => {
                console.log('Fetch Error :-S', err);
            }).then(() => {
                player.loadMedia(playlist.getFirstElement());
                player.play();
            });
        });
    }

}

window.addEventListener('load', () => {
    var playlist = new Playlist();
    var player = new Player();

    document.querySelector('#import-button')
        .addEventListener('click', importFromRSS(playlist, player));
});
