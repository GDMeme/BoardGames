#pragma once

class Player {
    public:

        int balance;
        bool landmarks [4] {false};
        int numberOfRed[2] {0};
        int numberOfBlue[5] {1, 0, 0, 0, 0}; 
        int numberOfGreen[5] {1, 0, 0, 0, 0};
        int numberOfPurple[3] {0};
        
        Player() {
            this->balance = 0;
        }

        ~Player() {}


    private:
};