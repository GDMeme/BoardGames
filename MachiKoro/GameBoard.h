#pragma once

#include "Player.h"

class GameBoard {
    public:
        GameBoard(int numOfPlayers) {
            this->players = new Player* [numOfPlayers];
            this->numOfPlayers = numOfPlayers;
        }

        ~GameBoard() {
            for (int i = 0; i < numOfPlayers; i++) {
                delete players[i];
            }
        }
    private:
        Player** players;
        int numOfPlayers;
};