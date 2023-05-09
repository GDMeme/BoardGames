#pragma once

#include "Player.h"

class GameBoard {
    public:
        std::vector<Player*> players;

        GameBoard(int numOfPlayers) {
            this->players = std::vector<Player*> (numOfPlayers);
            for (int i = 0; i < numOfPlayers; i++) {
                players[i] = new Player();
            }
            this->numOfPlayers = numOfPlayers;
        }

        ~GameBoard() {
            for (Player* i: players) {
                delete i;
            }
        }
    private:
        int numOfPlayers;
};