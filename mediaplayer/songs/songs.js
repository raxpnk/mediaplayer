import { LightningElement, api, wire, track } from 'lwc';
import newone from '@salesforce/apex/Songurls.newone';
import getsongs from '@salesforce/apex/Songurls.getsongs';
import getart from '@salesforce/apex/Songurls.getart';
import relatearr from '@salesforce/apex/Songurls.relatearr';
import otherarr from '@salesforce/apex/Songurls.otherarr';
import likesong from '@salesforce/apex/Songurls.likesong';


export default class Songs extends LightningElement {
    songname; songgenre; songplays;
    songnameupcase;
    artistname;
    temp1; temp2;
    @track mainurl1 = '';
    @track mainurl2 = '';
    @track showaudio = true;
    loadsongbut = false;
    @track array = [];
    @track searchval = ''; shownames = false;
    showDropdown = false; filteroption = ''; flag = false;
    @track artarray = []; mainbutton; artistname2; songbutton;
    @track loopaudio = false; @track loopstyle = 'loopclass2';
    @track heartlike = false; @track topbuttonstyle = 'topbuttons'; @track finalimage = false; nextsongcheck = false;
    @track relatedarr = []; showheart = true;



    //render---------------------------------------------------------------------------------------------------------------
    renderedCallback() {
        if (this.flag === true) {
            this.connectedCallback();
        }
        const audioElement = this.template.querySelector('.audio1');
        if (audioElement) {
            this.nextsongcheck = true;
            audioElement.addEventListener('ended', this.handleAudioEnded.bind(this));
        }
    }



    //get list---------------------------------------------------------------------------------------------------------------
    connectedCallback() {
        console.log(this.searchval + '---sv');
        console.log(this.filteroption + '---fo');
        console.log('ex connectedcb--------------')
        getart({ a: this.searchval, b: this.filteroption })
            .then(data => {
                this.artarray = data.map(a => ({
                    Name: a.Name.toUpperCase(),
                    Genre__c: a.Genre__c.toUpperCase(),
                    mainbutton: 'songbutton'
                }));
            });

        getsongs({ a: this.searchval, b: this.filteroption })
            .then(data => {
                this.filteroption = '';
                this.flag = false;
                this.array = data;
                this.array = data.map(a => ({
                    Name: a.Name.toUpperCase(),
                    Artist__c: a.Artist__c.toUpperCase(),
                    Liked__c: a.Liked__c,
                    Genre__c: a.Genre__c,
                    Plays__c: a.Plays__c,
                    songbutton: 'songbutton'
                }));
            });
    }



    //like button---------------------------------------------------------------------------------------------------------------
    heartclick(event) {
        this.heartlike = !this.heartlike;
        if (this.heartlike === true) {
            this.topbuttonstyle = 'topbuttons2';
        }
        else {
            this.topbuttonstyle = 'topbuttons';
        }

        likesong({ a: this.songname, b: this.artistname })
            .then(data => {
                console.log('like or not----------------------');
                console.log(data.Liked__c);
            })
        console.log(this.heartlike);
    }



    //next or back condition---------------------------------------------------------------------------------------------------------
    handleNextOrBack(isBack) {
        console.log(isBack ? 'Back button clicked' : 'Song ended');
        const currentIndex = this.relatedarr.findIndex((item) => item.Name === this.songname);
        let nextIndex = isBack ? currentIndex - 1 : currentIndex + 1;
        if (nextIndex < 0) {
            nextIndex = this.relatedarr.length - 1;
            console.log(nextIndex + 'nextindex');
        }
        if (nextIndex === this.relatedarr.length) {
            nextIndex = 0;
            console.log(nextIndex);
        }

        if (nextIndex >= 0 && nextIndex < this.relatedarr.length) {
            const nextItem = this.relatedarr[nextIndex];
            this.nextSongName = nextItem.Name;
            this.nextArtistName = nextItem.Artist__c;
            console.log('Next Song Name:', this.nextSongName);
            console.log('Next Artist Name:', this.nextArtistName);

            const matchedItem = this.relatedarr.find((item) => {
                return item.Name === this.nextSongName && item.Artist__c === this.nextArtistName;
            });

            if (matchedItem) {
                console.log('Found match:', matchedItem.Name);
                const buttons = this.template.querySelectorAll('button');
                buttons.forEach((button) => {
                    if (button.value === matchedItem.Name) {
                        button.click();
                    }
                });
            } else {
                console.log('No match found in the array.');
            }
        } else {
            console.log(isBack ? 'No previous song in the array.' : 'No next song in the array.');
        }
    }


    //next && back button---------------------------------------------------------------------------------------------------------------
    handleAudioEnded() {
        if (this.nextsongcheck === true) {
            this.handleNextOrBack(false);
        }
    }

    handleBackClick() {
        this.handleNextOrBack(true);
    }


    //search && filter option---------------------------------------------------------------------------------------------------------------
    handlesearch(event) {
        this.searchval = event.target.value;
        this.flag = true;
    }

    filterclick(event) {
        this.showDropdown = !this.showDropdown;
    }

    filterbutton(event) {
        this.showDropdown = !this.showDropdown;
        this.filteroption = event.target.value;
        this.flag = true;
    }



    //change in songs && images----------------------------------------------------------------------------------------------------------
    handlesongclick(event) {
        console.log(this.songgenre);
        const mainsong = this.songname + 'song';
        newone({ a: mainsong })
            .then(data => {
                this.temp1 = data + '?';
                console.log(this.temp1);
                this.mainurl1 = this.temp1;
                this.showaudio = true;
            })
            .catch(error => {
                console.log('errror in song' + error);
            });

        relatearr({ a: this.songgenre, b: mainsong })
            .then(data => {
                this.relatedarr = data;
                this.relatedarr = this.relatedarr.map(a => ({
                    ...this.relatedarr,
                    Name: a.Name.toUpperCase(),
                    Genre__c: a.Genre__c.toUpperCase(),
                    Plays__c: a.Plays__c,
                    Artist__c: a.Artist__c.toUpperCase()
                }));
            })
            .catch(error => {
                console.log('error in relarr', error);
            });
    }


    handleimageclick(event) {
        const mainimage = this.songname + 'image';
        newone({ a: mainimage })
            .then(data => {
                this.temp2 = data + '?';
                console.log(this.temp2);
                this.mainurl2 = this.temp2;
                this.showaudio = true;
            })
            .catch(error => {
                console.log('error in image' + error);
            })
    }


    get bgstyle() {
        const gradient = `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%)`;
        return `background-image: ${gradient}, url(${this.mainurl2});background-repeat: no-repeat;background-position: center;background-size: cover;`;
    }

    get bgstyle2() {
        return `background-image: url(${this.mainurl2});background-repeat: no-repeat;background-size:cover;background-position: center;`;
    }


    //song click---------------------------------------------------------------------------------------------------------------
    handlemain(event) {
        this.showheart = true;
        this.nextsongcheck = false;
        console.log('handlemain click');
        this.showaudio = false;
        this.songname = event.target.value;
        this.songnameupcase = this.songname.toUpperCase();
        console.log(this.songname);
        this.artistname = event.target.dataset.artist;
        console.log(this.artistname);
        this.songgenre = event.target.dataset.genre;
        this.songplays = event.target.dataset.plays;
        console.log(this.songplays + 'plays' + this.songgenre + 'genre');
        this.handlesongclick();
        this.handleimageclick();
        this.array = this.array.map(a => ({
            ...this.array,
            Name: a.Name,
            Artist__c: a.Artist__c,
            Liked__c: a.Liked__c,
            Genre__c: a.Genre__c,
            Plays__c: a.Plays__c,
            songbutton: this.songname === a.Name ? 'hh' : 'songbutton'
        }));
        this.array.forEach(a => {
            if (this.songname === a.Name) {
                if (a.Liked__c === true) {
                    console.log('this is a liked song');
                    this.topbuttonstyle = 'topbuttons2';
                }
                else {
                    this.topbuttonstyle = 'topbuttons';
                    console.log('not a liked song');
                }
            }
        });



        this.artarray = this.artarray.map(a => ({
            ...this.artarray,
            Name: a.Name,
            Genre__c: a.Genre__c,
            mainbutton: 'songbutton',
        }));
        this.songgenre = this.songgenre.toUpperCase();
        this.shownames = true;
        this.finalimage = true;
    }


    //artist click---------------------------------------------------------------------------------------------------------------
    handlemain2(event) {
        this.showheart = false;
        this.artistname2 = event.target.value;
        this.finalimage = false;
        this.songgenre = ''; this.songplays = '';
        this.mainurl2 = 'https://cunning-moose-7wl3gp-dev-ed--c.trailblaze.vf.force.com/resource/1690348546000/userimage?';
        this.songnameupcase = this.artistname2.toUpperCase();
        console.log(this.artistname2);
        this.artistname = event.target.dataset.genre;
        this.artistname = this.artistname.toUpperCase();
        this.artarray = this.artarray.map(a => ({
            ...this.artarray,
            Name: a.Name,
            Genre__c: a.Genre__c,
            mainbutton: this.artistname2 === a.Name ? 'hh' : 'songbutton',
        }));
        this.array = this.array.map(a => ({
            ...this.array,
            Name: a.Name,
            Artist__c: a.Artist__c,
            Liked__c: a.Liked__c,
            Genre__c: a.Genre__c,
            Plays__c: a.Plays__c,
            songbutton: 'songbutton'
        }));

        otherarr({ a: this.artistname2 })
            .then(data => {
                this.relatedarr = data;
                this.relatedarr = this.relatedarr.map(a => ({
                    ...this.relatedarr,
                    Name: a.Name.toUpperCase(),
                    Artist__c: a.Artist__c.toUpperCase(),
                    Liked__c: a.Liked__c,
                    Genre__c: a.Genre__c.toUpperCase(),
                    Plays__c: a.Plays__c,
                }));
            })
            .catch(error => {
                console.log('error in other arr', error);
            });

        this.shownames = true;
    }



    //replay button---------------------------------------------------------------------------------------------------------------
    handleReplay() {
        const audioElement = this.template.querySelector('.audio1');
        if (audioElement) {
            audioElement.currentTime = 0;
            audioElement.play();
        }
    }



    //loop button---------------------------------------------------------------------------------------------------------------
    handleloop() {
        this.loopaudio = !this.loopaudio;
        if (this.loopaudio == true) {
            console.log('looping');
            this.loopstyle = 'loopclass';
        }
        else {
            console.log('noloop');
            this.loopstyle = 'loopclass2'
        }
        const audioElement = this.template.querySelector('.audio1');
        if (audioElement) {
            audioElement.loop = this.loopaudio;
        }
    }
}