#include <stdio.h>
#include <cstdlib>
#include <cstdint>
#include <iostream>
#include <string.h>
#include <stddef.h>

#define u8 unsigned char
#define u32 unsigned int

#define ANIMATION_SEQUENCE_SIZE 10

#define W(n) std::cout << (#n) << " = " << (n) << std::endl;

struct PK2SPRITE_ANIMAATIO
{

    u8 sekvenssi[ANIMATION_SEQUENCE_SIZE]; // sequence
    u8 frameja;                            // frames
    bool looppi;                           // loop
};

// TODO(teawithsand): determine structure paddings used here, as they matter for reading offsets
struct PrototypeClass13
{

    u32 tyyppi;                 // sprite type
    char kuvatiedosto[100];     // bmp path
    char aanitiedostot[7][100]; // sound path (max 7)
    u32 aanet[7];               // sound types

    u8 frameja;                         // number of frames
    PK2SPRITE_ANIMAATIO animaatiot[20]; // animation sequences
    u8 animaatioita;                    // number of animations
    u8 frame_rate;                      // frame rate
    u32 kuva_x;                         // x position of first frame
    u32 kuva_y;                         // y position of first frame
    u32 kuva_frame_leveys;              // frame width
    u32 kuva_frame_korkeus;             // frame height
    u32 kuva_frame_vali;                // space between frames

    char nimi[30];       // name
    u32 leveys;          // width
    u32 korkeus;         // height
    double weight;       // weight (for jump and switches)
    bool vihollinen;     // if sprite is a enemy
    u32 energia;         //?sprite energy
    u32 vahinko;         //?damage if it got hit
    u8 vahinko_tyyppi;   //?damage type
    u8 suojaus;          //?protection type
    u32 pisteet;         // how much score
    u32 AI[10];          // AI type (max 10)
    u8 max_hyppy;        // max jump time
    double max_nopeus;   // max speed
    u32 charge_time;     //?wait post shoot
    u8 vari;             // color
    bool este;           // is a wall
    u32 tuhoutuminen;    // how sprite is destroyed
    bool avain;          // can sprite open locks
    bool vibrate;        //?sprite randomly
    u8 bonusten_lkm;     // number of bonuses
    u32 attack1_time;    // attack 1 duration (frames)
    u32 attack2_time;    // attack 2 duration (frames)
    u32 pallarx_kerroin; // parallax type (just to TYPE_BACKGROUND)

    char muutos_sprite[100]; // another sprite that this sprite may change
    char bonus_sprite[100];  // bonus that this sprite gives
    char ammus1_sprite[100]; // ammo 1 sprite
    char ammus2_sprite[100]; // ammo 2 sprite

    bool tiletarkistus; //?make sounds?
    u32 aani_frq;       // sound frequency (def. 22050)
    bool random_frq;    // use random frequency?

    bool este_ylos;       // if is wall at up
    bool este_alas;       // if is wall at down
    bool este_oikealle;   // if is wall at right
    bool este_vasemmalle; // if is wall at left

    u8 lapinakyvyys;   // transparency //unused
    bool hehkuu;       // if it is transparent //unused
    u32 tulitauko;     //*ammuspriten ampujalle aiheuttama charge_time
    bool can_glide;    // can drip quietly down?
    bool boss;         // if it is a boss //unused
    bool bonus_always; // if not there is 1/4 chance of droping bonus
    bool can_swim;     // walk fast under water
};

int main()
{

    FILE *fd = fopen("../res/models/data/hen.spr", "rb");
    if (!fd)
    {
        perror("FD filed");
        return 12;
    }

    char version[4];
    fread(&version, 4, 1, fd);
    PrototypeClass13 pc;
    memset(&pc, sizeof(pc), 0);
    fread(&pc, sizeof(pc), 1, fd);

    W((int)pc.frame_rate);
    W(pc.nimi);
    W((int)pc.frameja);
    W(pc.kuva_x);
    W(pc.kuva_y);
    W(pc.aanet[0]);
    W((int)pc.frameja);
    W(pc.can_glide);
    W(pc.can_swim);
    W(pc.kuva_frame_leveys);
    W(pc.kuva_frame_korkeus);
    W(pc.kuva_frame_vali);
    W(pc.muutos_sprite);
    W(pc.bonus_sprite);
    W(pc.ammus1_sprite);
    W(pc.ammus2_sprite);
    W(pc.leveys);
    W(pc.korkeus);
    W(pc.attack1_time);
    W(pc.attack2_time);
    W(pc.energia);
    W(pc.pisteet);
    W((int)pc.max_hyppy);

    int pos = ftell(fd);
    fseek(fd, 0, SEEK_END);
    int end = ftell(fd);

    W(end - pos);
    return 0;
}