#include <iostream>
#include <stdlib.h>
#include <time.h>

#include "GameBoard.h"

using namespace std;

int main() {
    cout << "Welcome to Machi Koro" << endl;
    cout << "How many people will be playing?" << endl;
    int numOfPlayers;
    cin >> numOfPlayers;
    GameBoard* gameBoard = new GameBoard(numOfPlayers);
    bool winner = false;
    int playerCounter = 1;
    string rollVerify;
    srand(time(NULL));
    int roll;
    while (!winner) {
        cout << "Player " << playerCounter << "'s turn!" << endl;
        cout << "Press R to roll the dice" << endl;
        while(cin >> rollVerify) {
            if (rollVerify == "R") {
                break;
            } else {
                cout << "You failed to roll the dice..." << endl;
            }
        };
        cout << "You rolled a " << rand() % 6 + 1 << "." << endl;
        // red
        // green and blue
        // purple

        // if upgraded landmark, check if winner
    }
    delete gameBoard;
}